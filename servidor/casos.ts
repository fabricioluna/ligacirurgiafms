// Casos disponíveis no servidor. O servidor lê o caso do próprio projeto:
// o navegador manda só o id, nunca o conteúdo do caso.

import type { Caso } from '../src/motor/tipos.js'
import caso001 from '../casos/caso-001.json' with { type: 'json' }

const casos = [caso001 as unknown as Caso].filter((c) => c.publicado)

export const casoPublicado = (id: unknown) => (typeof id === 'string' ? casos.find((c) => c.id === id) : undefined)

// Só para desenvolvimento (IA_SIMULADA=1): IA de mentira baseada nas palavras-chave dos casos.
export async function iaSimuladaDoCaso(sistema: string, usuario: string) {
  const { criarIaSimulada } = await import('./iaSimulada.js')
  const palavras = new Map<string, string[]>()
  for (const c of casos) {
    for (const i of [...c.caso.anamnese, ...c.caso.exameFisico, ...c.caso.exames]) palavras.set(i.id, i.palavrasChave ?? [])
  }
  return criarIaSimulada(palavras)(sistema, usuario)
}
