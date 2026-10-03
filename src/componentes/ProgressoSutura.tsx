// Progresso do caso em pontos de sutura: o fio corre na horizontal e cada momento é uma travessa.
// Momento concluído = ponto fechado (verde). Atual = ponto aberto. Futuro = marca apagada.

export type EstadoPonto = 'fechado' | 'aberto' | 'futuro'

interface Props {
  pontos: { rotulo: string; estado: EstadoPonto }[]
  // Índice do ponto que acabou de ser fechado por uma ação do aluno: só ele anima.
  animarIndice?: number
  className?: string
}

const PASSO = 44

export function ProgressoSutura({ pontos, animarIndice, className = '' }: Props) {
  const largura = pontos.length * PASSO
  const concluidos = pontos.filter((p) => p.estado === 'fechado').length
  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${largura} 28`}
        width={largura}
        height={28}
        role="img"
        aria-label={`Progresso do caso: ${concluidos} de ${pontos.length} momentos concluídos`}
        className="block max-w-full overflow-visible"
      >
        <line x1={0} y1={14} x2={largura} y2={14} stroke="var(--borda)" strokeWidth={2} />
        <line
          x1={0}
          y1={14}
          x2={Math.min(largura, concluidos * PASSO + PASSO / 2)}
          y2={14}
          stroke="var(--verde)"
          strokeWidth={2}
          style={{ transition: 'all 400ms ease-out' }}
        />
        {pontos.map((p, i) => {
          const x = i * PASSO + PASSO / 2
          if (p.estado === 'fechado') {
            return (
              <g key={i} stroke="var(--verde)" strokeWidth={3} strokeLinecap="square">
                <line x1={x - 5} y1={3} x2={x - 5} y2={25} className={i === animarIndice ? 'ponto-fecha' : undefined} />
                <line x1={x + 5} y1={3} x2={x + 5} y2={25} className={i === animarIndice ? 'ponto-fecha' : undefined} />
                <title>{p.rotulo}: concluído</title>
              </g>
            )
          }
          if (p.estado === 'aberto') {
            return (
              <g key={i} stroke="var(--verde-texto)" strokeWidth={2.5} fill="none">
                <path d={`M${x - 5} 4 L${x - 5} 11 M${x - 5} 17 L${x - 5} 24 M${x + 5} 4 L${x + 5} 11 M${x + 5} 17 L${x + 5} 24`} />
                <circle cx={x} cy={14} r={3.5} fill="var(--fundo)" />
                <title>{p.rotulo}: em andamento</title>
              </g>
            )
          }
          return (
            <g key={i} stroke="var(--borda)" strokeWidth={2}>
              <line x1={x - 5} y1={8} x2={x - 5} y2={20} />
              <line x1={x + 5} y1={8} x2={x + 5} y2={20} />
              <title>{p.rotulo}: ainda não alcançado</title>
            </g>
          )
        })}
      </svg>
      <style>{`
        .ponto-fecha { stroke-dasharray: 22; animation: fecha 360ms ease-out both; }
        @keyframes fecha { from { stroke-dashoffset: 22; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  )
}

// Divisória entre blocos: linha fina com um ponto de sutura no centro. Usar com parcimônia.
export function DivisoriaSutura({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-borda" />
      <svg width="22" height="16" viewBox="0 0 22 16">
        <line x1="0" y1="8" x2="22" y2="8" stroke="var(--borda)" strokeWidth="1.5" />
        <line x1="7" y1="2" x2="7" y2="14" stroke="var(--verde)" strokeWidth="2" />
        <line x1="15" y1="2" x2="15" y2="14" stroke="var(--verde)" strokeWidth="2" />
      </svg>
      <span className="h-px flex-1 bg-borda" />
    </div>
  )
}
