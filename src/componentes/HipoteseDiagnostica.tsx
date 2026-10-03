// Hipótese diagnóstica no simulador estático: o aluno escolhe uma opção antes da conduta.

import { useMemo, useState } from 'react'
import { embaralharEstavel } from '../motor/avaliacao'
import { rotuloHipotese, todasAsHipoteses } from '../motor/diagnostico'
import { useTentativa } from '../tentativa'

export function HipoteseDiagnostica({ aviso, aoRegistrar }: { aviso?: string; aoRegistrar?: () => void }) {
  const { caso, tentativa, registrarDiagnostico } = useTentativa()
  const opcoes = useMemo(() => embaralharEstavel(todasAsHipoteses(caso), `${tentativa!.id}:dx`), [caso, tentativa])
  const [escolhida, setEscolhida] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="m-0 border-b border-borda px-4 py-3 text-sm">
        {aviso && <span className="mb-1 block font-semibold text-subotima">{aviso}</span>}
        <span className="font-semibold">Qual a sua hipótese diagnóstica?</span>{' '}
        <span className="text-texto-2">Ela vale parte da nota e não pode ser trocada depois.</span>
      </p>
      <div role="radiogroup" aria-label="Hipótese diagnóstica" className="min-h-0 flex-1 overflow-y-auto p-2">
        {opcoes.map((h) => (
          <label key={h} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 hover:bg-fundo ${escolhida === h ? 'bg-verde-suave' : ''}`}>
            <input type="radio" name="hipotese" checked={escolhida === h} onChange={() => setEscolhida(h)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--verde)]" />
            <span>{rotuloHipotese(h)}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-borda p-3">
        <button type="button" className="botao botao-principal w-full" disabled={!escolhida} onClick={() => {
            if (!escolhida) return
            registrarDiagnostico(escolhida, rotuloHipotese(escolhida))
            aoRegistrar?.()
          }}>
          {escolhida ? (aviso ? 'Registrar a hipótese e confirmar a conduta' : 'Registrar a hipótese') : 'Escolha uma hipótese'}
        </button>
      </div>
    </div>
  )
}
