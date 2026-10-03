// Acesso ao painel do professor por código simples (PAINEL_CODIGO), sem login.
// Quem acerta o código recebe uma senha temporária (válida por 8 horas), assinada com o próprio código:
// trocar o código na Vercel invalida todas as senhas temporárias já emitidas.

import { createHmac, timingSafeEqual } from 'node:crypto'
import { ErroPedido } from './http.js'

const VALIDADE_MS = 8 * 60 * 60 * 1000

// Limite de tentativas erradas por endereço (aproximado: por instância do servidor).
const JANELA_MS = 15 * 60 * 1000
const MAX_ERROS = 8
const erros = new Map<string, { inicio: number; n: number }>()

function codigoConfigurado(): string {
  const c = process.env.PAINEL_CODIGO?.trim()
  if (!c || c.length < 8) throw new ErroPedido('O painel ainda não está configurado: falta PAINEL_CODIGO (mínimo de 8 caracteres).', 503)
  return c
}

const assinar = (texto: string, codigo: string) => createHmac('sha256', codigo).update(`painel:${texto}`).digest('base64url')

function iguais(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function entrar(codigoDigitado: unknown, ip: string, agora = Date.now()): { token: string; expiraEm: number } {
  const codigo = codigoConfigurado()
  const e = erros.get(ip)
  if (e && agora - e.inicio < JANELA_MS && e.n >= MAX_ERROS) throw new ErroPedido('Muitas tentativas erradas. Espere 15 minutos.', 429)
  if (typeof codigoDigitado !== 'string' || !iguais(codigoDigitado.trim(), codigo)) {
    if (!e || agora - e.inicio >= JANELA_MS) erros.set(ip, { inicio: agora, n: 1 })
    else e.n++
    throw new ErroPedido('Código incorreto.', 401)
  }
  erros.delete(ip)
  const expiraEm = agora + VALIDADE_MS
  return { token: `${expiraEm}.${assinar(String(expiraEm), codigo)}`, expiraEm }
}

export function exigirAcesso(token: unknown, agora = Date.now()) {
  const codigo = codigoConfigurado()
  if (typeof token !== 'string') throw new ErroPedido('Entre com o código do painel.', 401)
  const [exp, assinatura] = token.split('.')
  if (!exp || !assinatura || !iguais(assinatura, assinar(exp, codigo))) throw new ErroPedido('Acesso inválido. Entre de novo.', 401)
  if (Number(exp) < agora) throw new ErroPedido('O acesso expirou. Entre de novo.', 401)
}
