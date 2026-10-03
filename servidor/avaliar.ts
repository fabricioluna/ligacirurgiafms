// /api/avaliar: relaciona a conduta escrita pelo aluno com os itens da folha resposta do momento.
// A IA não classifica: quem classifica é o motor do caso, com as mesmas regras do simulador estático.

import { opcoesDoMomento } from '../src/motor/avaliacao.js'
import { momentoFolha } from '../src/motor/caso.js'
import type { Caso } from '../src/motor/tipos.js'
import { casoPublicado } from './casos.js'
import type { ChamarIA } from './gemini.js'
import { ErroIA } from './gemini.js'
import { ErroPedido, textoDoAluno } from './http.js'
import { SISTEMA_AVALIADOR } from './prompts.js'

export interface RespostaAvaliar {
  // Itens da folha (texto exato) que o aluno propôs.
  itens: string[]
  // Trechos que não correspondem a nenhum item: viram condutas não previstas.
  naoReconhecidos: string[]
}

// Só entram os itens que também aparecem como opção no simulador estático.
// Itens derivados (como "anamnese dirigida") dependem do que o aluno fez, não do que escreveu.
export function itensComId(caso: Caso, codigo: string) {
  const folha = momentoFolha(caso, codigo)
  const opcoes = new Set(opcoesDoMomento(caso, codigo, 'servidor').map((o) => o.item))
  const grupos: [string, string[]][] = [
    ['I', folha.ideal],
    ['A', folha.aceitaveis ?? []],
    ['S', (folha.subotimas ?? []).map((s) => s.conduta)],
    ['E', folha.errosCriticos],
  ]
  const lista: { id: string; texto: string }[] = []
  for (const [prefixo, itens] of grupos) {
    itens.forEach((texto, i) => {
      if (opcoes.has(texto)) lista.push({ id: `${prefixo}${i + 1}`, texto })
    })
  }
  return lista
}

export function mensagemAvaliar(caso: Caso, codigo: string, texto: string) {
  return [
    'ITENS DA FOLHA RESPOSTA DESTE MOMENTO (id | conduta):',
    ...itensComId(caso, codigo).map((i) => `${i.id} | ${i.texto}`),
    '',
    `<aluno>${texto.replace(/<\/?aluno>/gi, '')}</aluno>`,
  ].join('\n')
}

export function interpretarAvaliar(caso: Caso, codigo: string, bruto: unknown): RespostaAvaliar {
  if (!bruto || typeof bruto !== 'object') throw new ErroIA('Saída da IA fora do formato')
  const s = bruto as { ids?: unknown; trechosNaoReconhecidos?: unknown }
  if (!Array.isArray(s.ids)) throw new ErroIA('Ids inválidos')
  const porId = new Map(itensComId(caso, codigo).map((i) => [i.id, i.texto]))
  const itens = [...new Set(s.ids.filter((x): x is string => typeof x === 'string' && porId.has(x)).map((x) => porId.get(x)!))]
  const naoReconhecidos = Array.isArray(s.trechosNaoReconhecidos)
    ? s.trechosNaoReconhecidos
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((x) => x.trim().slice(0, 200))
        .slice(0, 10)
    : []
  return { itens, naoReconhecidos }
}

export async function processarAvaliar(corpo: Record<string, unknown>, ia: ChamarIA): Promise<RespostaAvaliar> {
  const caso = casoPublicado(corpo.casoId)
  if (!caso) throw new ErroPedido('Caso não encontrado.', 404)
  const codigo = corpo.momento
  if (typeof codigo !== 'string' || !caso.folhaResposta.momentos.some((m) => m.codigo === codigo)) {
    throw new ErroPedido('Momento inválido.')
  }
  const texto = textoDoAluno(corpo.texto)
  const bruto = await ia(SISTEMA_AVALIADOR, mensagemAvaliar(caso, codigo, texto))
  return interpretarAvaliar(caso, codigo, bruto)
}
