// Como cada informação descoberta aparece: fala do paciente como citação, exame como laudo.

import type { Descoberta as TDescoberta } from '../motor/tipos'
import { VisualizadorImagem } from './VisualizadorImagem'

// Resultado vem em texto corrido no caso; cada parte separada por ';' vira uma linha do laudo.
const linhas = (texto: string) => texto.split(/;\s*/).filter(Boolean)

export function Descoberta({ d, casoId }: { d: TDescoberta; casoId: string }) {
  if (d.tipo === 'anamnese') {
    return (
      <div>
        <p className="m-0 mb-1 text-sm text-texto-2">{d.titulo}</p>
        <blockquote className="fala m-0">{d.texto}</blockquote>
      </div>
    )
  }
  return (
    <div className="laudo">
      <div className="flex items-baseline justify-between gap-3 border-b border-borda px-3 py-2">
        <p className="m-0 text-sm font-semibold">{d.titulo}</p>
        <p className="m-0 shrink-0 text-xs text-texto-2">{d.tipo === 'exameFisico' ? 'Exame físico' : 'Resultado'}</p>
      </div>
      <div className="px-3 py-2.5">
        {linhas(d.texto).map((l, i) => (
          <p key={i} className="m-0">
            {l}
          </p>
        ))}
      </div>
      {d.imagem && (
        <div className="border-t border-borda p-3">
          <VisualizadorImagem casoId={casoId} imagem={d.imagem} />
        </div>
      )}
    </div>
  )
}
