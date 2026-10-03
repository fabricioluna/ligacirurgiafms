// Embrulho comum das funções /api: só POST, JSON pequeno, limite de chamadas e erros sem detalhes internos.

import { ErroIA } from './gemini.js'

export class ErroPedido extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
  }
}

const TAMANHO_MAXIMO = 8_000 // bytes do corpo
export const TEXTO_MAXIMO = 400 // caracteres do que o aluno escreve

// Limite aproximado: vale por instância do servidor, não globalmente.
// A proteção definitiva contra gasto é o limite configurado na conta do Google.
const JANELA_MS = 10 * 60 * 1000
const MAXIMO_NA_JANELA = 80
const chamadas = new Map<string, { inicio: number; n: number }>()

function dentroDoLimite(chave: string, agora = Date.now()) {
  const c = chamadas.get(chave)
  if (!c || agora - c.inicio > JANELA_MS) {
    chamadas.set(chave, { inicio: agora, n: 1 })
    if (chamadas.size > 5000) chamadas.clear()
    return true
  }
  c.n++
  return c.n <= MAXIMO_NA_JANELA
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })

export function funcao(processar: (corpo: Record<string, unknown>) => Promise<unknown>, tamanhoMaximo = TAMANHO_MAXIMO) {
  return {
    async fetch(request: Request): Promise<Response> {
      if (request.method !== 'POST') return json({ erro: 'Use POST.' }, 405)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
      const sessao = request.headers.get('x-sessao')?.slice(0, 64) || ''
      if (!dentroDoLimite(`${ip}|${sessao}`)) return json({ erro: 'Limite de chamadas atingido. Tente em alguns minutos.' }, 429)

      const bruto = await request.text()
      if (bruto.length > tamanhoMaximo) return json({ erro: 'Pedido grande demais.' }, 413)
      let corpo: unknown
      try {
        corpo = JSON.parse(bruto)
      } catch {
        return json({ erro: 'JSON inválido.' }, 400)
      }
      if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return json({ erro: 'Corpo inválido.' }, 400)

      try {
        return json(await processar(corpo as Record<string, unknown>))
      } catch (e) {
        if (e instanceof ErroPedido) return json({ erro: e.message }, e.status)
        if (e instanceof ErroIA) {
          console.error('[ia]', e.message)
          return json({ erro: 'IA indisponível.' }, 503)
        }
        console.error('[api]', e)
        return json({ erro: 'Erro interno.' }, 500)
      }
    },
  }
}

export function textoDoAluno(v: unknown): string {
  if (typeof v !== 'string') throw new ErroPedido('Texto ausente.')
  const t = v.trim()
  if (!t) throw new ErroPedido('Texto vazio.')
  if (t.length > TEXTO_MAXIMO) throw new ErroPedido(`Texto com mais de ${TEXTO_MAXIMO} caracteres.`)
  return t
}

export function listaDeCodigos(v: unknown, maximo: number): string[] {
  if (v === undefined) return []
  if (!Array.isArray(v) || v.length > maximo || v.some((x) => typeof x !== 'string' || x.length > 20)) {
    throw new ErroPedido('Lista inválida.')
  }
  return v as string[]
}
