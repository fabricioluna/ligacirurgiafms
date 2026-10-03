// Nota da tentativa. Calculada só sobre os momentos que o aluno de fato jogou:
// se o caso termina cedo, os momentos não alcançados não entram na conta.
// Conduta não prevista não pontua nem penaliza (fica fora da conta).

import { codigoBase } from './caso.js'
import { PERCENTUAL_DIAGNOSTICO } from './diagnostico.js'
import type { Caso, Passo, Tentativa } from './tipos.js'

export interface NotaMomento {
  momento: string
  peso: number
  percentual: number | null
  pontos: number | null
}

export interface Nota {
  final: number | null
  porMomento: NotaMomento[]
  faixa: string | null
  // Nota só das condutas (0 a 100) e, se o caso pede, a do diagnóstico.
  condutas: number | null
  diagnostico: { peso: number; percentual: number } | null
}

// O diagnóstico vale `peso`% da nota final; as condutas, o restante.
// Sem hipótese registrada num caso que a pede, o diagnóstico conta zero.
export function calcularNota(caso: Caso, passos: Passo[], diagnostico?: Tentativa['diagnostico']): Nota {
  const { pesos, escala, faixas } = caso.folhaResposta
  const porMomento: NotaMomento[] = passos.map((p) => {
    const peso = pesos[codigoBase(p.momento)] ?? 0
    const percentual = escala[p.classificacao]
    return { momento: p.momento, peso, percentual, pontos: percentual === null ? null : (peso * percentual) / 100 }
  })
  const contados = porMomento.filter((m) => m.pontos !== null)
  const pesoTotal = contados.reduce((s, m) => s + m.peso, 0)
  const condutas = pesoTotal ? (contados.reduce((s, m) => s + (m.pontos ?? 0), 0) / pesoTotal) * 100 : null
  const dx = caso.folhaResposta.diagnostico
  const notaDx = dx ? { peso: dx.peso, percentual: diagnostico ? PERCENTUAL_DIAGNOSTICO[diagnostico.classificacao] : 0 } : null
  const final =
    condutas === null ? null : Math.round(notaDx ? condutas * (1 - notaDx.peso / 100) + notaDx.percentual * (notaDx.peso / 100) : condutas)
  const faixa = final === null ? null : (faixas ?? []).find((f) => final >= f.de && final <= f.ate)?.rotulo ?? null
  return { final, porMomento, faixa, condutas: condutas === null ? null : Math.round(condutas), diagnostico: notaDx }
}
