// Chamadas do navegador às funções /api. Nenhuma chave aqui: só o servidor fala com o Gemini.

import type { Acao, ComentarioPreceptor, Passo, TipoDescoberta } from './motor/tipos'

export type Intencao = 'pergunta' | 'exame_fisico' | 'pedido_exame' | 'conduta' | 'fora_de_escopo'

export interface RespostaPaciente {
  intencao: Intencao
  itens: { tipo: TipoDescoberta; id: string }[]
  respostaPadrao: string | null
}

export interface RespostaAvaliar {
  itens: string[]
  naoReconhecidos: string[]
}

export class FalhaIA extends Error {
  constructor(
    message: string,
    readonly limite = false,
  ) {
    super(message)
  }
}

const TEMPO_LIMITE_MS = 12_000

async function chamar<T>(rota: string, sessao: string, corpo: unknown, tempoLimiteMs = TEMPO_LIMITE_MS): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new FalhaIA('Sem conexão com a internet.')
  let r: Response
  try {
    r = await fetch(`/api/${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sessao': sessao },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(tempoLimiteMs),
    })
  } catch {
    throw new FalhaIA('A IA demorou demais ou a conexão caiu.')
  }
  if (r.status === 429) throw new FalhaIA('Muitas mensagens em pouco tempo. Espere alguns minutos ou use a lista.', true)
  if (!r.ok) throw new FalhaIA('A IA não respondeu.')
  try {
    return (await r.json()) as T
  } catch {
    throw new FalhaIA('A IA respondeu fora do formato.')
  }
}

export const perguntarPaciente = (sessao: string, corpo: { casoId: string; caminho: string[]; texto: string; atalho?: Acao }) =>
  chamar<RespostaPaciente>('paciente', sessao, corpo)

export const interpretarConduta = (sessao: string, corpo: { casoId: string; momento: string; texto: string }) =>
  chamar<RespostaAvaliar>('avaliar', sessao, corpo)

export const escreverComentario = (
  sessao: string,
  corpo: { casoId: string; desfecho: string; qtdNaoPrevistas: number; passos: Passo[] },
) =>
  chamar<ComentarioPreceptor>(
    'feedback',
    sessao,
    {
      ...corpo,
      // Só o necessário: o servidor reconstrói o resto a partir do caso.
      passos: corpo.passos.map((p) => ({
        momento: p.momento,
        classificacao: p.classificacao,
        selecionados: p.selecionados,
        errosCriticos: p.errosCriticos,
        subotimas: p.subotimas.map((s) => s.conduta),
        faltaram: p.faltaram,
        regraAplicada: p.regraAplicada,
      })),
    },
    30_000,
  )
