// Casos que já têm roteiro guiado. Caso sem roteiro não mostra o modo guiado.

import type { Caso } from '../motor/tipos'
import type { Roteiro } from './tipos'
import { roteiro001 } from './roteiros/caso-001'

const TODOS: Roteiro[] = [roteiro001]

export function roteiroDoCaso(caso: Caso): Roteiro | null {
  const r = TODOS.find((x) => x.casoId === caso.id)
  return r ? { ...r, versaoCaso: caso.versao } : null
}
