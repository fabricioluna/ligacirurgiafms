// Uma troca na conversa com o paciente: o que o aluno disse e o que o paciente respondeu.
// A fala do paciente é citação com filete verde, nunca balão de aplicativo de conversa.

import type { Fala } from '../motor/tipos'

export function FalaConversa({ f, nome }: { f: Fala; nome?: string }) {
  return (
    <div>
      <p className="m-0 mb-1 text-sm text-texto-2">
        <span className="font-medium">Você:</span> {f.aluno}
      </p>
      <blockquote className="fala m-0">
        {nome && <span className="mb-0.5 block text-xs font-semibold not-italic text-texto-2">{nome}</span>}
        {f.paciente}
      </blockquote>
    </div>
  )
}
