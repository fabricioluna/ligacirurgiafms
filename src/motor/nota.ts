// Nota da tentativa. Calculada só sobre os momentos que o aluno de fato jogou:
// se o caso termina cedo, os momentos não alcançados não entram na conta.
// Conduta não prevista não pontua nem penaliza (fica fora da conta).

import { codigoBase } from './caso.js'
import type { Caso, Passo } from './tipos.js'

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
}

export function calcularNota(caso: Caso, passos: Passo[]): Nota {
  const { pesos, escala, faixas } = caso.folhaResposta
  const porMomento: NotaMomento[] = passos.map((p) => {
    const peso = pesos[codigoBase(p.momento)] ?? 0
    const percentual = escala[p.classificacao]
    return { momento: p.momento, peso, percentual, pontos: percentual === null ? null : (peso * percentual) / 100 }
  })
  const contados = porMomento.filter((m) => m.pontos !== null)
  const pesoTotal = contados.reduce((s, m) => s + m.peso, 0)
  const final = pesoTotal ? Math.round((contados.reduce((s, m) => s + (m.pontos ?? 0), 0) / pesoTotal) * 100) : null
  const faixa = final === null ? null : (faixas ?? []).find((f) => final >= f.de && final <= f.ate)?.rotulo ?? null
  return { final, porMomento, faixa }
}
