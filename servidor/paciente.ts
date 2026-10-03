// /api/paciente: entende o pedido do aluno (pergunta, exame físico, exame complementar)
// e aponta os itens do caso que correspondem. A IA não escreve a resposta: o texto
// mostrado é sempre o do caso, e sem correspondência vale a resposta padrão do caso.

import { acoesDisponiveis, exameDisponivel, examesAtuais, momento } from '../src/motor/caso.js'
import type { Acao, Caso, TipoDescoberta } from '../src/motor/tipos.js'
import { casoPublicado } from './casos.js'
import type { ChamarIA } from './gemini.js'
import { ErroIA } from './gemini.js'
import { ErroPedido, listaDeCodigos, textoDoAluno } from './http.js'
import { SISTEMA_PACIENTE } from './prompts.js'

export type Intencao = 'pergunta' | 'exame_fisico' | 'pedido_exame' | 'conduta' | 'fora_de_escopo'

export interface RespostaPaciente {
  intencao: Intencao
  itens: { tipo: TipoDescoberta; id: string }[]
  respostaPadrao: string | null
}

const INTENCOES: Intencao[] = ['pergunta', 'exame_fisico', 'pedido_exame', 'conduta', 'fora_de_escopo']
const ATALHOS: Record<string, Intencao> = { anamnese: 'pergunta', exameFisico: 'exame_fisico', exames: 'pedido_exame' }
const TIPO_DA_INTENCAO: Partial<Record<Intencao, TipoDescoberta>> = {
  pergunta: 'anamnese',
  exame_fisico: 'exameFisico',
  pedido_exame: 'exames',
}

// Texto do sistema, não do caso: usado só quando o caso não define resposta para exame físico ausente.
const SEGMENTO_AUSENTE = 'Esse segmento do exame físico não consta neste caso.'

export function mensagemPaciente(caso: Caso, codigo: string, caminho: string[], texto: string) {
  const m = momento(caso, codigo)
  const acoes = acoesDisponiveis(m)
  const linhas = [`MOMENTO: ${m.nome}`]
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
    for (const e of examesAtuais(caso, caminho).filter((x) => exameDisponivel(caso, x, codigo))) {
      linhas.push(`${e.id} | ${e.nome}`)
    }
  }
  linhas.push('', `<aluno>${texto.replace(/<\/?aluno>/gi, '')}</aluno>`)
  return linhas.join('\n')
}

// Confere a saída da IA contra o caso. Id que não existe, ou que não está disponível
// neste momento, é descartado.
export function interpretarPaciente(
  caso: Caso,
  codigo: string,
  caminho: string[],
  bruto: unknown,
  atalho?: Acao,
): RespostaPaciente {
  if (!bruto || typeof bruto !== 'object') throw new ErroIA('Saída da IA fora do formato')
  const s = bruto as { intencao?: unknown; ids?: unknown; tipoNaoListado?: unknown }
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
      acoes.includes('exames')
        ? examesAtuais(caso, caminho).filter((e) => exameDisponivel(caso, e, codigo)).map((e) => e.id)
        : [],
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

  if (intencao === 'conduta' || itens.length) return { intencao, itens, respostaPadrao: null }

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
  return { intencao, itens, respostaPadrao }
}

export async function processarPaciente(corpo: Record<string, unknown>, ia: ChamarIA): Promise<RespostaPaciente> {
  const caso = casoPublicado(corpo.casoId)
  if (!caso) throw new ErroPedido('Caso não encontrado.', 404)
  const caminho = listaDeCodigos(corpo.caminho, 12)
  const codigos = new Set(caso.caso.momentos.map((m) => m.codigo))
  if (!caminho.length || caminho.some((c) => !codigos.has(c))) throw new ErroPedido('Momento inválido.')
  const codigo = caminho[caminho.length - 1]
  const texto = textoDoAluno(corpo.texto)
  const atalho = typeof corpo.atalho === 'string' && corpo.atalho in ATALHOS ? (corpo.atalho as Acao) : undefined

  const dica = atalho ? `\n\nO aluno marcou o atalho: ${ATALHOS[atalho]}.` : ''
  const bruto = await ia(SISTEMA_PACIENTE, mensagemPaciente(caso, codigo, caminho, texto) + dica)
  return interpretarPaciente(caso, codigo, caminho, bruto, atalho)
}
