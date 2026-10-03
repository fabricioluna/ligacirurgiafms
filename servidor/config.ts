// Configuração geral que o professor muda pelo painel (por enquanto, o modo de contingência).
// Fica no Firestore em config/geral. Sem credencial ou sem conexão, vale o padrão (IA ligada).

import { ErroPedido } from './http.js'

export interface ConfigGeral {
  contingencia: boolean
}

let cache: { em: number; config: ConfigGeral } | null = null
const CACHE_MS = 20_000

export async function lerConfig(): Promise<ConfigGeral> {
  if (cache && Date.now() - cache.em < CACHE_MS) return cache.config
  let config: ConfigGeral = { contingencia: false }
  const { adminConfigurado } = await import('./admin.js')
  if (!adminConfigurado()) return config
  try {
    const { firestoreAdmin } = await import('./admin.js')
    const d = (await (await firestoreAdmin()).collection('config').doc('geral').get()).data()
    config = { contingencia: d?.contingencia === true }
  } catch {
    // mantém o padrão
  }
  cache = { em: Date.now(), config }
  return config
}

export async function gravarConfig(config: ConfigGeral) {
  const { firestoreAdmin } = await import('./admin.js')
  await (await firestoreAdmin()).collection('config').doc('geral').set(config, { merge: true })
  cache = { em: Date.now(), config }
}

// As funções de IA recusam o pedido quando o professor ligou o modo de contingência.
export async function exigirIALigada() {
  if ((await lerConfig()).contingencia) throw new ErroPedido('contingencia', 503)
}
