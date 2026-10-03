// Chamadas do painel do professor. A senha temporária fica só nesta aba (sessionStorage).

import type { Caso } from '../motor/tipos'
import type { Validacao } from '../motor/validacao'

const CHAVE = 'simulador:painel'

export function tokenSalvo(): string | null {
  try {
    const t = sessionStorage.getItem(CHAVE)
    if (!t) return null
    return Number(t.split('.')[0]) > Date.now() ? t : null
  } catch {
    return null
  }
}

export function salvarToken(t: string | null) {
  try {
    if (t) sessionStorage.setItem(CHAVE, t)
    else sessionStorage.removeItem(CHAVE)
  } catch {
    // sem armazenamento: o professor entra de novo ao recarregar
  }
}

export class ErroPainel extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function chamarPainel<T>(acao: string, dados: Record<string, unknown> = {}, tempoLimiteMs = 30_000): Promise<T> {
  let r: Response
  try {
    r = await fetch('/api/painel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, token: tokenSalvo(), ...dados }),
      signal: AbortSignal.timeout(tempoLimiteMs),
    })
  } catch {
    throw new ErroPainel('Sem resposta do servidor. Confira a internet e tente de novo.', 0)
  }
  const corpo = (await r.json().catch(() => null)) as ({ erro?: string } & T) | null
  if (!r.ok) {
    if (r.status === 401) salvarToken(null)
    throw new ErroPainel(corpo?.erro ?? 'Erro no servidor.', r.status)
  }
  return corpo as T
}

export interface TentativaResumo {
  id: string
  casoId: string
  modo: 'estatico' | 'ia'
  nomeInformado: string
  iniciadaEm: number | null
  finalizadaEm: number | null
  atualizadaEm: number | null
  notaFinal: number | null
  desfecho: string | null
  qtdNaoPrevistas: number
  errosCriticos: string[]
  passos: { momento: string; classificacao: string; textoDoAluno: string | null }[]
}

export interface NaoPrevistaResumo {
  id: string
  casoId: string
  momento: string
  textoDoAluno: string
  revisada: boolean
  em: number | null
}

export interface ImagemDoCaso {
  id: string
  arquivos: string[]
  exame: string
  legenda: string
}

export interface CasoResumo {
  id: string
  titulo: string
  origem: 'projeto' | 'painel'
  publicado: boolean
  versao: string
  atualizadoEm?: number | null
  validacao: Validacao
  imagens: ImagemDoCaso[]
  caso?: Caso
}

export interface Resumo {
  config: { contingencia: boolean }
  tentativas: TentativaResumo[]
  naoPrevistas: NaoPrevistaResumo[]
  casos: CasoResumo[]
}
