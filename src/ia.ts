// Chamadas do navegador às funções /api. Nenhuma chave aqui: só o servidor fala com o Gemini.

import type { Acao, ComentarioPreceptor, Passo, TipoDescoberta } from './motor/tipos'

export type Intencao = 'pergunta' | 'conversa' | 'exame_fisico' | 'pedido_exame' | 'conduta' | 'fora_de_escopo'

export interface RespostaPaciente {
  intencao: Intencao
  itens: { tipo: TipoDescoberta; id: string }[]
  respostaPadrao: string | null
  fala: string | null
  foraDoRoteiro: boolean
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

// O servidor pode tentar duas vezes (8 s cada) antes de desistir.
const TEMPO_LIMITE_MS = 20_000

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
  if (r.status === 503 && (await r.clone().json().catch(() => null))?.erro === 'contingencia') {
    throw new FalhaIA('O professor ligou o modo sem IA.')
  }
  if (!r.ok) throw new FalhaIA('A IA não respondeu.')
  try {
    return (await r.json()) as T
  } catch {
    throw new FalhaIA('A IA respondeu fora do formato.')
  }
}

export const perguntarPaciente = (
  sessao: string,
  corpo: {
    casoId: string
    caminho: string[]
    texto: string
    atalho?: Acao
    historico?: { aluno: string; paciente: string }[]
    feitos?: string[]
  },
) => chamar<RespostaPaciente>('paciente', sessao, corpo)

export const interpretarHipotese = (sessao: string, corpo: { casoId: string; momento: string; texto: string }) =>
  chamar<RespostaAvaliar>('avaliar', sessao, { ...corpo, tipo: 'diagnostico' })

export const interpretarConduta = (sessao: string, corpo: { casoId: string; momento: string; texto: string }) =>
  chamar<RespostaAvaliar>('avaliar', sessao, corpo)

export const escreverComentario = (
  sessao: string,
  corpo: { casoId: string; desfecho: string; qtdNaoPrevistas: number; passos: Passo[]; diagnostico?: string },
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
    50_000,
  )
