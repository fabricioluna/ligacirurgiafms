// Casos disponíveis no aparelho:
// - os do projeto, que vêm junto com o site e funcionam sempre, inclusive sem internet;
// - os publicados pelo painel do professor, buscados em /api/casos e guardados no aparelho
//   para continuarem disponíveis no modo sem internet.
// A mesma chamada traz a configuração geral (modo de contingência ligado pelo professor).

import { useSyncExternalStore } from 'react'
import { gravar, ler } from '../armazenamento'
import type { Caso } from '../motor/tipos'
import caso001 from '../../casos/caso-001.json'

export const casosDoProjeto: Caso[] = [caso001 as unknown as Caso].filter((c) => c.publicado)

export interface ConfigGeral {
  contingencia: boolean
}

interface Estado {
  remotos: Caso[]
  config: ConfigGeral
  previas: Caso[]
}

const CHAVE_CASOS = 'simulador:casos-remotos'
const CHAVE_CONFIG = 'simulador:config'

let estado: Estado = {
  remotos: (ler<Caso[]>(CHAVE_CASOS) ?? []).filter((c) => c && typeof c.id === 'string'),
  config: ler<ConfigGeral>(CHAVE_CONFIG) ?? { contingencia: false },
  previas: [],
}
const ouvintes = new Set<() => void>()
const mudar = (novo: Partial<Estado>) => {
  estado = { ...estado, ...novo }
  ouvintes.forEach((f) => f())
}

export async function atualizarCasos() {
  try {
    const r = await fetch('/api/casos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(10_000) })
    if (!r.ok) return
    const d = (await r.json()) as { casos?: Caso[]; config?: ConfigGeral }
    const remotos = (d.casos ?? []).filter((c) => c?.publicado && !casosDoProjeto.some((p) => p.id === c.id))
    const config = { contingencia: d.config?.contingencia === true }
    gravar(CHAVE_CASOS, remotos)
    gravar(CHAVE_CONFIG, config)
    mudar({ remotos, config })
  } catch {
    // sem internet: segue com o que está guardado no aparelho
  }
}

// Prévia do painel: o caso ainda não publicado fica só nesta aba.
export function registrarPrevia(caso: Caso) {
  mudar({ previas: [...estado.previas.filter((c) => c.id !== caso.id), caso] })
}

export const ehPrevia = (id: string) => estado.previas.some((c) => c.id === id)

export function buscarCaso(id: string): Caso | undefined {
  return estado.previas.find((c) => c.id === id) ?? casosDoProjeto.find((c) => c.id === id) ?? estado.remotos.find((c) => c.id === id)
}

export const configGeral = () => estado.config

const assinar = (f: () => void) => {
  ouvintes.add(f)
  return () => ouvintes.delete(f)
}

export function useCasos() {
  const e = useSyncExternalStore(assinar, () => estado)
  return { casos: [...casosDoProjeto, ...e.remotos], config: e.config }
}
