// Avaliação após cada conduta: classificação, o que a sustenta na folha resposta
// e o que acontece com o paciente. O aluno confirma para seguir.

import { useEffect, useRef } from 'react'
import { ehDesfecho, momento, momentoFolha } from '../motor/caso'
import type { Passo } from '../motor/tipos'
import { useTentativa } from '../tentativa'
import { SeloClassificacao, corDaClassificacao } from './Classificacao'

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="m-0 space-y-1.5 pl-5">
      {itens.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}

export function AvaliacaoMomento({ passo }: { passo: Passo }) {
  const { caso, seguir } = useTentativa()
  const dialogo = useRef<HTMLDialogElement>(null)
  const folha = momentoFolha(caso, passo.momento)
  const regra = passo.regraAplicada ? caso.caso.regras.find((r) => r.codigo === passo.regraAplicada) : null
  const termina = ehDesfecho(passo.proximo)
  const proximo = termina ? null : momento(caso, passo.proximo)
  const ehAceitavelPorItem = passo.classificacao === 'aceitavel' && (folha.aceitaveis ?? []).includes(passo.itemDaFolha ?? '')

  useEffect(() => {
    const d = dialogo.current
    if (d && !d.open) d.showModal()
  }, [])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-avaliacao"
      onCancel={(e) => e.preventDefault()}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-fundo p-0 text-texto backdrop:bg-black/70 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:max-w-2xl sm:border sm:border-borda"
    >
      <div className="flex h-full flex-col">
        <div className="border-b-4 px-5 pt-6 pb-4" style={{ borderColor: corDaClassificacao(passo.classificacao) }}>
          <p className="m-0 text-sm text-texto-2">{momento(caso, passo.momento).nome}</p>
          <h2 id="titulo-avaliacao" className="mt-2 mb-0 font-sans text-base font-normal">
            <span className="sr-only">Classificação da conduta: </span>
            <SeloClassificacao c={passo.classificacao} grande />
          </h2>
        </div>

        <div className="leitura min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:flex-none">
          {passo.classificacao === 'perigosa' && (
            <section>
              <h3 className="m-0 mb-2 font-sans text-base font-semibold text-perigosa">
                {passo.errosCriticos.length > 1 ? 'Erros críticos' : 'Erro crítico'}
              </h3>
              <Lista itens={passo.errosCriticos} />
            </section>
          )}

          {passo.subotimas.length > 0 && (
            <section>
              <h3 className="m-0 mb-2 font-sans text-base font-semibold">O que custou caro</h3>
              <ul className="m-0 space-y-2 pl-5">
                {passo.subotimas.map((s) => (
                  <li key={s.conduta}>
                    {s.conduta} <span className="text-texto-2">Custo: {s.custo}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ehAceitavelPorItem && (
            <section>
              <h3 className="m-0 mb-2 font-sans text-base font-semibold">Sua conduta corresponde a</h3>
              <p className="m-0">{passo.itemDaFolha}</p>
            </section>
          )}

          {passo.classificacao === 'ideal' ? (
            <section>
              <p className="m-0">Sua conduta cobre todos os itens do caminho ideal deste momento.</p>
              <div className="mt-3 text-texto-2">
                <Lista itens={folha.justificativa} />
              </div>
            </section>
          ) : (
            passo.faltaram.length > 0 && (
              <section>
                <h3 className="m-0 mb-2 font-sans text-base font-semibold">O caminho ideal também incluía</h3>
                <Lista itens={passo.faltaram} />
              </section>
            )
          )}

          <section className="border-l-2 border-borda pl-4">
            <h3 className="m-0 mb-1 font-sans text-base font-semibold">O que acontece com o paciente</h3>
            {regra && <p className="m-0">{regra.entao}</p>}
            {proximo && (
              <p className={`m-0 text-texto-2 ${regra ? 'mt-1' : ''}`}>
                Próximo momento: {proximo.nome}.{proximo.tempo ? ` ${proximo.tempo}` : ''}
              </p>
            )}
            {termina && !regra && <p className="m-0 text-texto-2">O caso chega ao desfecho.</p>}
          </section>
        </div>

        <div className="border-t border-borda p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" autoFocus className="botao botao-principal w-full" onClick={seguir}>
            {termina ? 'Ver o desfecho' : 'Seguir para o próximo momento'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
