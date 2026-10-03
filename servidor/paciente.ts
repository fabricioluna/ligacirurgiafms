// /api/paciente: o aluno conversa com o paciente.
// Numa chamada só, a IA (1) aponta os itens do caso que o pedido cobre e (2) escreve a fala do
// paciente, no jeito dele. O servidor confere os ids contra o caso e a fala contra as fontes
// permitidas (verificarFala). Se a fala trouxer algo que não está nas fontes, ela é descartada
// e o aluno vê o texto do próprio caso. Exames e laudos são sempre o texto do caso.

import { acoesDisponiveis, exameDisponivel, examesAtuais, exameFisicoAtual, momento, sinaisVitaisAtuais } from '../src/motor/caso.js'
import type { Acao, Caso, TipoDescoberta } from '../src/motor/tipos.js'
import { casoPublicado } from './casos.js'
import { exigirIALigada } from './config.js'
import type { ChamarIA } from './gemini.js'
import { ErroIA } from './gemini.js'
import { ErroPedido, listaDeCodigos, textoDoAluno } from './http.js'
import { SISTEMA_PACIENTE } from './prompts.js'
import { verificarFala } from './verificarFala.js'

export type Intencao = 'pergunta' | 'conversa' | 'exame_fisico' | 'pedido_exame' | 'conduta' | 'fora_de_escopo'

export interface RespostaPaciente {
  intencao: Intencao
  itens: { tipo: TipoDescoberta; id: string }[]
  respostaPadrao: string | null
  // Fala do paciente, já conferida. Ausente quando não há o que dizer ou quando a fala foi descartada.
  fala: string | null
}

export interface Troca {
  aluno: string
  paciente: string
}

const INTENCOES: Intencao[] = ['pergunta', 'conversa', 'exame_fisico', 'pedido_exame', 'conduta', 'fora_de_escopo']
const ATALHOS: Record<string, Intencao> = { anamnese: 'pergunta', exameFisico: 'exame_fisico', exames: 'pedido_exame' }
const TIPO_DA_INTENCAO: Partial<Record<Intencao, TipoDescoberta>> = {
  pergunta: 'anamnese',
  exame_fisico: 'exameFisico',
  pedido_exame: 'exames',
}

// Texto do sistema, não do caso: usado só quando o caso não define resposta para exame físico ausente.
const SEGMENTO_AUSENTE = 'Esse segmento do exame físico não consta neste caso.'

function situacaoAtual(caso: Caso, codigo: string, caminho: string[]) {
  const m = momento(caso, codigo)
  const texto = caminho.length <= 1 ? caso.caso.apresentacaoInicial.texto : m.situacao
  const vitais = sinaisVitaisAtuais(caso, caminho).map((s) => `${s.rotulo}: ${s.valor}`).join('; ')
  return { texto, vitais }
}

function quemE(caso: Caso) {
  const p = caso.caso.paciente
  return p ? `${p.nome}, ${p.idade} anos. ${p.jeito}${p.acompanhante ? ` Está acompanhado de ${p.acompanhante}.` : ''}` : ''
}

export function mensagemPaciente(caso: Caso, codigo: string, caminho: string[], texto: string, historico: Troca[] = []) {
  const m = momento(caso, codigo)
  const acoes = acoesDisponiveis(m)
  const sit = situacaoAtual(caso, codigo, caminho)
  const limpar = (s: string) => s.replace(/<\/?(aluno|historico)>/gi, '')
  const linhas = [
    `PACIENTE: ${quemE(caso) || 'Paciente do caso.'}`,
    `MOMENTO: ${m.nome}`,
    `COMO O PACIENTE ESTÁ AGORA: ${sit.texto}`,
    `SINAIS VITAIS: ${sit.vitais}`,
    `RESPOSTA PADRÃO PARA O QUE NÃO ESTÁ NO CASO: ${caso.caso.respostaPadrao.perguntaNaoListada}`,
  ]
  if (acoes.includes('anamnese')) {
    linhas.push('', 'ANAMNESE (id | tema | resposta do paciente):')
    for (const a of caso.caso.anamnese) linhas.push(`${a.id} | ${a.tema} | ${a.resposta}`)
  }
  if (acoes.includes('exameFisico')) {
    linhas.push('', 'EXAME FÍSICO (id | segmento):')
    for (const e of caso.caso.exameFisico) linhas.push(`${e.id} | ${e.segmento}`)
  }
  if (acoes.includes('exames')) {
    linhas.push('', 'EXAMES COMPLEMENTARES DISPONÍVEIS (id | nome):')
    for (const e of examesAtuais(caso, caminho).filter((x) => exameDisponivel(caso, x, codigo))) linhas.push(`${e.id} | ${e.nome}`)
  }
  if (historico.length) {
    linhas.push('', '<historico>')
    for (const h of historico) linhas.push(`Estudante: ${limpar(h.aluno)}`, `Paciente: ${limpar(h.paciente)}`)
    linhas.push('</historico>')
  }
  linhas.push('', `<aluno>${limpar(texto)}</aluno>`)
  return linhas.join('\n')
}

// Fontes que a fala pode usar: respostas dos itens apontados, situação atual, quem é o paciente,
// resposta padrão e o que o paciente já disse. Para exame físico, os achados apontados.
function fontesDaFala(caso: Caso, codigo: string, caminho: string[], itens: RespostaPaciente['itens'], historico: Troca[]) {
  const sit = situacaoAtual(caso, codigo, caminho)
  const p = caso.caso.paciente
  const fontes = [sit.texto, sit.vitais, caso.caso.respostaPadrao.perguntaNaoListada, ...historico.map((h) => h.paciente)]
  if (p) fontes.push(`${p.nome} ${p.idade} anos ${p.jeito} ${p.acompanhante ?? ''}`)
  const ef = exameFisicoAtual(caso, caminho)
  for (const i of itens) {
    if (i.tipo === 'anamnese') fontes.push(caso.caso.anamnese.find((a) => a.id === i.id)?.resposta ?? '')
    if (i.tipo === 'exameFisico') fontes.push(ef.find((e) => e.id === i.id)?.achado ?? '')
  }
  return fontes
}

// Confere a saída da IA contra o caso. Id que não existe, ou que não está disponível
// neste momento, é descartado. A fala passa pelo verificador.
export function interpretarPaciente(
  caso: Caso,
  codigo: string,
  caminho: string[],
  bruto: unknown,
  atalho?: Acao,
  historico: Troca[] = [],
): RespostaPaciente {
  if (!bruto || typeof bruto !== 'object') throw new ErroIA('Saída da IA fora do formato')
  const s = bruto as { intencao?: unknown; ids?: unknown; tipoNaoListado?: unknown; fala?: unknown }
  if (!INTENCOES.includes(s.intencao as Intencao)) throw new ErroIA('Intenção inválida')
  if (s.ids !== undefined && !Array.isArray(s.ids)) throw new ErroIA('Ids inválidos')

  let intencao = s.intencao as Intencao
  if (atalho && ATALHOS[atalho] && intencao !== 'conduta') intencao = ATALHOS[atalho]

  const m = momento(caso, codigo)
  const acoes = acoesDisponiveis(m)
  const disponivel: Record<TipoDescoberta, Set<string>> = {
    anamnese: new Set(acoes.includes('anamnese') ? caso.caso.anamnese.map((a) => a.id) : []),
    exameFisico: new Set(acoes.includes('exameFisico') ? caso.caso.exameFisico.map((e) => e.id) : []),
    exames: new Set(
      acoes.includes('exames') ? examesAtuais(caso, caminho).filter((e) => exameDisponivel(caso, e, codigo)).map((e) => e.id) : [],
    ),
  }
  const tipoDoId = (id: string): TipoDescoberta | null =>
    disponivel.anamnese.has(id) ? 'anamnese' : disponivel.exameFisico.has(id) ? 'exameFisico' : disponivel.exames.has(id) ? 'exames' : null

  const tipoEsperado = TIPO_DA_INTENCAO[intencao]
  const vistos = new Set<string>()
  const itens: RespostaPaciente['itens'] = []
  for (const id of (s.ids ?? []) as unknown[]) {
    if (typeof id !== 'string' || vistos.has(id)) continue
    const tipo = tipoDoId(id)
    if (!tipo || (tipoEsperado && tipo !== tipoEsperado)) continue
    vistos.add(id)
    itens.push({ tipo, id })
  }

  // Fala do paciente: só no que ele mesmo diz. Em conduta não há fala; em pedido de exame,
  // só uma reação curta (o laudo é o texto do caso).
  // Pergunta clínica sem item no caso: a fala da IA é ignorada, porque um "não tenho" seria
  // informação inventada que o verificador de palavras não pega. Vale a resposta padrão do caso.
  const semFonte = intencao === 'pergunta' && itens.length === 0
  let fala: string | null = null
  if (typeof s.fala === 'string' && s.fala.trim() && intencao !== 'conduta' && !semFonte && acoes.includes('anamnese')) {
    const r = verificarFala(s.fala, fontesDaFala(caso, codigo, caminho, itens, historico))
    if (r.ok) fala = s.fala.trim()
    else console.warn(`[paciente] fala descartada: ${r.motivo}`)
  }

  if (intencao === 'conduta' || intencao === 'conversa' || itens.length) return { intencao, itens, respostaPadrao: null, fala }

  const rp = caso.caso.respostaPadrao as Caso['caso']['respostaPadrao'] & { exameFisicoNaoListado?: string }
  const tipoNL = s.tipoNaoListado
  const respostaPadrao =
    intencao === 'pedido_exame'
      ? tipoNL === 'imagem'
        ? rp.imagemNaoListada
        : rp.laboratorioNaoListado
      : intencao === 'exame_fisico'
        ? rp.exameFisicoNaoListado ?? SEGMENTO_AUSENTE
        : tipoNL === 'parecer' && rp.parecerEspecialista
          ? rp.parecerEspecialista
          : rp.perguntaNaoListada
  return { intencao, itens, respostaPadrao, fala }
}

function historicoValido(v: unknown): Troca[] {
  if (!Array.isArray(v)) return []
  return v
    .slice(-6)
    .filter((h): h is Troca => !!h && typeof h.aluno === 'string' && typeof h.paciente === 'string')
    .map((h) => ({ aluno: h.aluno.slice(0, 400), paciente: h.paciente.slice(0, 500) }))
}

export async function processarPaciente(corpo: Record<string, unknown>, ia: ChamarIA): Promise<RespostaPaciente> {
  const caso = await casoPublicado(corpo.casoId)
  if (!caso) throw new ErroPedido('Caso não encontrado.', 404)
  await exigirIALigada()
  const caminho = listaDeCodigos(corpo.caminho, 12)
  const codigos = new Set(caso.caso.momentos.map((m) => m.codigo))
  if (!caminho.length || caminho.some((c) => !codigos.has(c))) throw new ErroPedido('Momento inválido.')
  const codigo = caminho[caminho.length - 1]
  const texto = textoDoAluno(corpo.texto)
  const atalho = typeof corpo.atalho === 'string' && corpo.atalho in ATALHOS ? (corpo.atalho as Acao) : undefined
  const historico = historicoValido(corpo.historico)

  const dica = atalho ? `\n\nO estudante marcou o atalho: ${ATALHOS[atalho]}.` : ''
  const bruto = await ia(SISTEMA_PACIENTE, mensagemPaciente(caso, codigo, caminho, texto, historico) + dica, { temperatura: 0.4 })
  return interpretarPaciente(caso, codigo, caminho, bruto, atalho, historico)
}
