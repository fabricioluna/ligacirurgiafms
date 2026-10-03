import type { SinalVital } from '../motor/tipos'

// Valor alterado leva um sinal escrito, não só a cor.
export function SinaisVitais({ sinais }: { sinais: SinalVital[] }) {
  return (
    <dl className="laudo grid grid-cols-2 sm:grid-cols-3">
      {sinais.map((s) => (
        <div key={s.rotulo} className="-mb-px -mr-px border-b border-r border-borda px-3 py-2.5">
          <dt className="text-xs text-texto-2">{s.rotulo}</dt>
          <dd className={`numeros m-0 font-semibold ${s.alterado ? 'text-subotima' : ''}`}>
            {s.valor}
            {s.alterado && (
              <span className="ml-1.5 text-xs font-semibold" title="Valor alterado">
                ▲ alterado
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
