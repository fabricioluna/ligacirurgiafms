// Casos disponíveis no servidor. O servidor lê o caso do próprio projeto ou do Firestore:
// o navegador manda só o id, nunca o conteúdo do caso.

import type { Caso } from '../src/motor/tipos.js'
import caso001 from '../casos/caso-001.json' with { type: 'json' }

// Casos que vêm no projeto. Funcionam sempre, inclusive no modo sem internet.
export const casosDoProjeto = [caso001].map((c) => c as unknown as Caso)

const doProjeto = (id: string) => casosDoProjeto.find((c) => c.id === id && c.publicado)

// Casos cadastrados pelo professor no painel, guardados no Firestore.
const cache = new Map<string, { em: number; caso: Caso | null }>()
const CACHE_MS = 60_000

async function doFirestore(id: string): Promise<Caso | null> {
  const c = cache.get(id)
  if (c && Date.now() - c.em < CACHE_MS) return c.caso
  let caso: Caso | null = null
  const { adminConfigurado } = await import('./admin.js')
  if (!adminConfigurado()) return null
  try {
    const { firestoreAdmin } = await import('./admin.js')
    const db = await firestoreAdmin()
    const doc = await db.collection('casos').doc(id).get()
    const d = doc.data()
    if (d?.publicado && typeof d.json === 'string') caso = JSON.parse(d.json) as Caso
  } catch {
    caso = null // sem credencial ou sem conexão: o caso só não é encontrado
  }
  cache.set(id, { em: Date.now(), caso })
  return caso
}

export async function casoPublicado(id: unknown): Promise<Caso | undefined> {
  if (typeof id !== 'string' || !/^CASO-\d{3}$/.test(id)) return undefined
  return doProjeto(id) ?? (await doFirestore(id)) ?? undefined
}

export function esquecerCaso(id: string) {
  cache.delete(id)
}

// Só para desenvolvimento (IA_SIMULADA=1): IA de mentira baseada nas palavras-chave dos casos.
export async function iaSimuladaDoCaso(sistema: string, usuario: string) {
  const { criarIaSimulada } = await import('./iaSimulada.js')
  // Os ids (AN-01, EX-02...) se repetem entre casos: junta as palavras-chave de todos.
  const palavras = new Map<string, string[]>()
  for (const c of casosDoProjeto) {
    for (const i of [...c.caso.anamnese, ...c.caso.exameFisico, ...c.caso.exames]) {
      palavras.set(i.id, [...(palavras.get(i.id) ?? []), ...(i.palavrasChave ?? [])])
    }
  }
  return criarIaSimulada(palavras)(sistema, usuario)
}
