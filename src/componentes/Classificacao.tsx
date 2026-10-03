// Classificação nunca vai só pela cor: sempre rótulo escrito e ícone próprio.

import type { Classificacao } from '../motor/tipos'

export const ROTULO: Record<Classificacao, string> = {
  ideal: 'Ideal',
  aceitavel: 'Aceitável',
  subotima: 'Subótima',
  perigosa: 'Perigosa',
  nao_prevista: 'Não prevista',
}

const COR: Record<Classificacao, string> = {
  ideal: 'var(--c-ideal)',
  aceitavel: 'var(--c-aceitavel)',
  subotima: 'var(--c-subotima)',
  perigosa: 'var(--c-perigosa)',
  nao_prevista: 'var(--c-nao-prevista)',
}

export const corDaClassificacao = (c: Classificacao) => COR[c]

export function IconeClassificacao({ c, tamanho = 20 }: { c: Classificacao; tamanho?: number }) {
  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: COR[c],
    strokeWidth: 2.25,
    strokeLinecap: 'square' as const,
    'aria-hidden': true,
  }
  switch (c) {
    case 'ideal': // dois pontos de sutura fechados
      return (
        <svg {...comum}>
          <circle cx="12" cy="12" r="10" />
          <path d="M7 12.5l3.2 3.2L17 9" />
        </svg>
      )
    case 'aceitavel':
      return (
        <svg {...comum}>
          <path d="M4 12.5l5 5L20 7" />
        </svg>
      )
    case 'subotima':
      return (
        <svg {...comum}>
          <path d="M12 3L2.5 20h19z" />
          <path d="M12 10v4.5M12 17v.5" />
        </svg>
      )
    case 'perigosa':
      return (
        <svg {...comum}>
          <path d="M8 2.5h8l5.5 5.5v8L16 21.5H8L2.5 16V8z" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      )
    case 'nao_prevista':
      return (
        <svg {...comum}>
          <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17v.5" />
        </svg>
      )
  }
}

export function SeloClassificacao({ c, grande = false }: { c: Classificacao; grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold ${grande ? 'text-lg' : 'text-sm'}`}
      style={{ color: COR[c] }}
    >
      <IconeClassificacao c={c} tamanho={grande ? 26 : 18} />
      {ROTULO[c]}
    </span>
  )
}
