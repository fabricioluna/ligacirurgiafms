// /api/feedback: comentário do preceptor no relatório final.
// Os dados que a IA recebe são montados aqui, a partir do caso e da folha resposta.
// Do navegador só vem o que o aluno escolheu, e qualquer texto que não exista na folha é descartado.

import { momento, momentoFolha, desfecho as buscarDesfecho, ehDesfecho, codigoBase } from '../src/motor/caso.js'
import { calcularNota } from '../src/motor/nota.js'
import type { Caso, Classificacao, Passo } from '../src/motor/tipos.js'
import { categoriaDoItem } from '../src/motor/avaliacao.js'
import { casoPublicado } from './casos.js'
import { exigirIALigada } from './config.js'
import type { ChamarIA } from './gemini.js'
import { ErroIA } from './gemini.js'
import { ErroPedido } from './http.js'
import { SISTEMA_FEEDBACK } from './prompts.js'

export interface ComentarioPreceptor {
  resumo: string
  pontosFortes: string[]
  pontosACorrigir: string[]
  errosCriticos: string[]
  oQueEstudar: string
}

const CLASSIFICACOES: Classificacao[] = ['ideal', 'aceitavel', 'subotima', 'perigosa', 'nao_prevista']
const NOME: Record<Classificacao, string> = {
  ideal: 'ideal',
  aceitavel: 'aceitável',
  subotima: 'subótima',
  perigosa: 'perigosa (erro crítico)',
  nao_prevista: 'não prevista',
}

const lista = (v: unknown, max = 30): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : []

// Reconstrói os passos usando só o que existe no caso.
export function passosValidados(caso: Caso, bruto: unknown): Passo[] {
  if (!Array.isArray(bruto) || bruto.length === 0 || bruto.length > 12) throw new ErroPedido('Passos inválidos.')
  const codigos = new Set(caso.caso.momentos.map((m) => m.codigo))
  return bruto.map((b) => {
    const p = (b ?? {}) as Record<string, unknown>
    if (typeof p.momento !== 'string' || !codigos.has(p.momento)) throw new ErroPedido('Momento inválido.')
    if (!CLASSIFICACOES.includes(p.classificacao as Classificacao)) throw new ErroPedido('Classificação inválida.')
    const folha = momentoFolha(caso, p.momento)
    const daFolha = (v: unknown) => lista(v).filter((i) => categoriaDoItem(folha, i) !== null)
    const regra = caso.caso.regras.find((r) => r.codigo === p.regraAplicada && r.momento === p.momento)
    return {
      momento: p.momento,
      selecionados: daFolha(p.selecionados),
      classificacao: p.classificacao as Classificacao,
      itemDaFolha: null,
      errosCriticos: daFolha(p.errosCriticos).filter((i) => folha.errosCriticos.includes(i)),
      subotimas: (folha.subotimas ?? []).filter((s) => lista(p.subotimas).includes(s.conduta)),
      faltaram: daFolha(p.faltaram).filter((i) => folha.ideal.includes(i)),
      regraAplicada: regra?.codigo ?? null,
      proximo: regra?.vaiPara ?? momento(caso, p.momento).proximo ?? '',
      em: 0,
    }
  })
}

export function mensagemFeedback(caso: Caso, passos: Passo[], codigoDesfecho: string, qtdNaoPrevistas: number) {
  const nota = calcularNota(caso, passos)
  const d = buscarDesfecho(caso, codigoDesfecho)
  const fr = caso.folhaResposta
  const linhas = [
    `CASO: ${caso.caso.identificacao.titulo}`,
    `TEMA: ${caso.caso.identificacao.tema}`,
    `NOTA FINAL: ${nota.final ?? 'sem nota'}${nota.faixa ? ` (${nota.faixa})` : ''}`,
    `DESFECHO ALCANÇADO: ${d.texto}${d.qualidade ? ` [qualidade: ${d.qualidade}]` : ''}`,
    '',
    'PASSOS DO ESTUDANTE:',
  ]
  passos.forEach((p, i) => {
    const m = momento(caso, p.momento)
    const folha = momentoFolha(caso, p.momento)
    const regra = caso.caso.regras.find((r) => r.codigo === p.regraAplicada)
    linhas.push(``, `${i + 1}. ${m.nome}: classificação ${NOME[p.classificacao]}, ${nota.porMomento[i]?.pontos ?? 0} de ${nota.porMomento[i]?.peso ?? 0} pontos`)
    // A consequência vai na linha do item que a provocou, para não ser atribuída a outro erro.
    const gatilhos = new Set(regra?.disparadaPor ?? [])
    const consequencia = (item: string) => (regra && gatilhos.has(item) ? ` Consequência para o paciente: ${regra.entao}` : '')
    if (p.selecionados.length) linhas.push(`   Condutas do estudante: ${p.selecionados.join(' | ')}`)
    for (const e of p.errosCriticos) linhas.push(`   Erro crítico: ${e}${consequencia(e)}`)
    for (const s of p.subotimas) linhas.push(`   Subótima: ${s.conduta} Custo: ${s.custo}${consequencia(s.conduta)}`)
    if (p.faltaram.length) linhas.push(`   O caminho ideal também incluía: ${p.faltaram.join(' | ')}`)
    const ligada = [...p.errosCriticos, ...p.subotimas.map((s) => s.conduta)].some((i) => gatilhos.has(i))
    if (regra && !ligada) {
      linhas.push(`   Outro acontecimento, sem relação com os erros acima: o estudante ${regra.se.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}. Resultado: ${regra.entao}`)
    }
    if (folha.pontosDeRaciocinio?.length) linhas.push(`   Pontos de raciocínio da folha: ${folha.pontosDeRaciocinio.join(' | ')}`)
  })
  if (qtdNaoPrevistas > 0) linhas.push('', `CONDUTAS NÃO PREVISTAS: ${qtdNaoPrevistas}, registradas para o professor (não pontuam nem penalizam).`)
  linhas.push(
    '',
    `CAMINHO IDEAL: ${fr.caminhoIdeal}`,
    '',
    'MENSAGENS-CHAVE:',
    ...fr.mensagensChave.map((x) => `- ${x}`),
    '',
    'REFERÊNCIAS:',
    ...(caso.caso.identificacao.referencias ?? []).map((x) => `- ${x}`),
  )
  if (fr.orientacoesFeedback?.length) linhas.push('', 'ORIENTAÇÕES DO PROFESSOR PARA O FEEDBACK:', ...fr.orientacoesFeedback.map((x) => `- ${x}`))
  return linhas.join('\n')
}

const limpar = (s: string, max: number) => s.replace(/\s*[—–]\s*/g, ', ').trim().slice(0, max)

export function interpretarFeedback(bruto: unknown): ComentarioPreceptor {
  if (!bruto || typeof bruto !== 'object') throw new ErroIA('Saída da IA fora do formato')
  const s = bruto as Record<string, unknown>
  if (typeof s.resumo !== 'string' || !s.resumo.trim() || typeof s.oQueEstudar !== 'string') throw new ErroIA('Relatório incompleto')
  const itens = (v: unknown) => lista(v, 6).map((x) => limpar(x, 500)).filter(Boolean)
  return {
    resumo: limpar(s.resumo, 1200),
    pontosFortes: itens(s.pontosFortes),
    pontosACorrigir: itens(s.pontosACorrigir),
    errosCriticos: itens(s.errosCriticos),
    oQueEstudar: limpar(s.oQueEstudar, 900),
  }
}

export async function processarFeedback(corpo: Record<string, unknown>, ia: ChamarIA): Promise<ComentarioPreceptor> {
  const caso = await casoPublicado(corpo.casoId)
  if (!caso) throw new ErroPedido('Caso não encontrado.', 404)
  await exigirIALigada()
  const passos = passosValidados(caso, corpo.passos)
  const codigoDesfecho = corpo.desfecho
  if (typeof codigoDesfecho !== 'string' || !ehDesfecho(codigoDesfecho) || !caso.caso.desfechos.some((d) => d.codigo === codigoDesfecho)) {
    throw new ErroPedido('Desfecho inválido.')
  }
  const qtd = typeof corpo.qtdNaoPrevistas === 'number' ? Math.max(0, Math.min(50, Math.floor(corpo.qtdNaoPrevistas))) : 0
  // Cada momento conta uma vez (o ALT substitui o original).
  if (new Set(passos.map((p) => codigoBase(p.momento))).size !== passos.length) throw new ErroPedido('Passos repetidos.')
  const bruto = await ia(SISTEMA_FEEDBACK, mensagemFeedback(caso, passos, codigoDesfecho, qtd), { tempoLimiteMs: 20000, temperatura: 0.2 })
  return interpretarFeedback(bruto)
}
