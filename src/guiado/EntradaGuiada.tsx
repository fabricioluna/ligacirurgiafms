// Cartão da abertura do caso que leva ao modo guiado. Só aparece nos casos que têm roteiro.

import { useNavigate } from 'react-router'
import type { Caso } from '../motor/tipos'
import { estadoGuiadoSalvo, iniciarGuiado } from './TelaGuiada'
import { roteiroDoCaso } from './roteiros'

export function EntradaGuiada({ caso, nome }: { caso: Caso; nome: string }) {
  const navegar = useNavigate()
  if (!roteiroDoCaso(caso)) return null
  const salvo = estadoGuiadoSalvo(caso)
  const emAndamento = Boolean(salvo && !salvo.desfecho)
  const ir = (retomar: boolean) => {
    iniciarGuiado(caso, nome, retomar)
    navegar(`/caso/${caso.id}/guiado`)
  }
  return (
    <div className="mt-6 border border-borda bg-superficie p-5">
      <h2 className="m-0 text-xl">Modo guiado</h2>
      <p className="mt-2 mb-4 text-texto-2">
        Em cada decisão você escolhe uma entre até 6 alternativas e vê na hora se está no caminho certo e o que acontece com o paciente.
        Funciona mesmo sem internet.
      </p>
      <div className="flex flex-wrap gap-3">
        {emAndamento ? (
          <>
            <button type="button" className="botao botao-principal" onClick={() => ir(true)}>
              Continuar o modo guiado
            </button>
            <button type="button" className="botao botao-secundario" onClick={() => ir(false)}>
              Começar de novo
            </button>
          </>
        ) : (
          <button type="button" className="botao botao-principal" onClick={() => ir(false)}>
            Começar o modo guiado
          </button>
        )}
      </div>
    </div>
  )
}
