import type { Caso } from '../motor/tipos'
import caso001 from '../../casos/caso-001.json'

// Fase 1: os casos vêm de arquivos do próprio projeto. Na Fase 3 passam a vir do Firestore.
export const casos: Caso[] = [caso001 as unknown as Caso].filter((c) => c.publicado)

export const buscarCaso = (id: string) => casos.find((c) => c.id === id)
