// Modo de contingência: só o simulador estático, sem chamar a IA.
// Liga com ?contingencia=1 no endereço e fica lembrado no aparelho; desliga com ?contingencia=0.
// Na Fase 3 o professor também liga e desliga pelo painel.

import { apagar, gravar, ler } from './armazenamento'

const CHAVE = 'simulador:contingencia'

export function contingenciaAtiva(): boolean {
  try {
    const p = new URLSearchParams(window.location.search).get('contingencia')
    if (p === '1') gravar(CHAVE, true)
    if (p === '0') apagar(CHAVE)
  } catch {
    // sem URL ou sem armazenamento: segue o que estiver salvo
  }
  return ler<boolean>(CHAVE) === true
}
