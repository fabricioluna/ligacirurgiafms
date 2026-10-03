import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { AvaliacaoMomento } from '../componentes/AvaliacaoMomento'
import { Descoberta } from '../componentes/Descoberta'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { PainelAcoes } from '../componentes/PainelAcoes'
import { ProgressoSutura, type EstadoPonto } from '../componentes/ProgressoSutura'
import { SinaisVitais } from '../componentes/SinaisVitais'
import { codigoBase, ehDesfecho, momento, sinaisVitaisAtuais } from '../motor/caso'
import type { Acao, Caso, Tentativa } from '../motor/tipos'
import { useTentativa } from '../tentativa'

// Momentos do caminho principal (sem os ALT), um ponto de sutura para cada.
function pontosDoCaso(caso: Caso, t: Tentativa) {
  const principais: string[] = []
  let cod: string | undefined = caso.caso.momentos[0].codigo
  while (cod && !ehDesfecho(cod) && !principais.includes(cod)) {
    principais.push(cod)
    cod = momento(caso, cod).proximo
  }
  const feitos = new Set(t.passos.map((p) => codigoBase(p.momento)))
  const atual = codigoBase(t.momentoAtual)
  return principais.map((c) => ({
    rotulo: momento(caso, c).nome,
    estado: (feitos.has(c) ? 'fechado' : c === atual && !t.desfecho ? 'aberto' : 'futuro') as EstadoPonto,
  }))
}

export function Atendimento() {
  const { caso, tentativa } = useTentativa()
  const [acao, setAcao] = useState<Acao | null>(null)

  // No computador o painel começa aberto; no celular, fechado.
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) setAcao((a) => a ?? 'anamnese')
  }, [tentativa?.momentoAtual])

  useEffect(() => {
    if (tentativa?.aguardandoConfirmacao) setAcao(null)
  }, [tentativa?.aguardandoConfirmacao])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tentativa?.momentoAtual])

  if (!tentativa) return <Navigate to={`/caso/${caso.id}`} replace />
  if (tentativa.desfecho) return <Navigate to={`/caso/${caso.id}/desfecho`} replace />

  const m = momento(caso, tentativa.momentoAtual)
  const primeiro = tentativa.caminho.length === 1
  const pontos = pontosDoCaso(caso, tentativa)
  const ultimoPasso = tentativa.passos.at(-1)
  const animar = tentativa.aguardandoConfirmacao && ultimoPasso
    ? pontos.findIndex((p) => p.rotulo === momento(caso, codigoBase(ultimoPasso.momento)).nome)
    : undefined
  const descobertas = [...tentativa.descobertas].reverse()

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho>
        <div className="flex min-w-0 items-center gap-3">
          <ProgressoSutura pontos={pontos} animarIndice={animar} className="shrink-0" />
        </div>
      </Cabecalho>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 lg:pb-10">
        <div className="min-w-0">
          {m.tempo && <p className="m-0 mb-1 text-sm text-texto-2">{m.tempo}</p>}
          <h1 className="m-0 text-2xl">{m.nome}</h1>

          <p className="leitura mt-4 mb-0">{primeiro ? caso.caso.apresentacaoInicial.texto : m.situacao}</p>

          {/* Momento sem sinais vitais no caso não repete os do momento anterior. */}
          {(primeiro || Boolean(m.sinaisVitais?.length)) && (
            <>
              <h2 className="mt-6 mb-2 font-sans text-sm font-semibold text-texto-2">Sinais vitais</h2>
              <SinaisVitais sinais={sinaisVitaisAtuais(caso, tentativa.caminho)} />
            </>
          )}

          <p className="mt-8 mb-0 font-titulo text-xl font-semibold text-verde-texto">
            {primeiro ? caso.caso.apresentacaoInicial.pergunta : m.pergunta}
          </p>

          <section className="mt-10" aria-labelledby="titulo-historico">
            <h2 id="titulo-historico" className="m-0 font-sans text-sm font-semibold text-texto-2">
              O que você já descobriu
            </h2>
            {descobertas.length === 0 ? (
              <p className="mt-3 mb-0 text-texto-2">
                Ainda nada. Use os atalhos para perguntar ao paciente, examinar e pedir exames antes de definir a conduta.
              </p>
            ) : (
              <ol className="leitura m-0 mt-4 list-none space-y-5 p-0">
                {descobertas.map((d) => (
                  <li key={`${d.id}-${d.momento}`}>
                    {d.momento !== tentativa.momentoAtual && (
                      <p className="m-0 mb-1 text-xs text-texto-2">Em: {momento(caso, d.momento).nome}</p>
                    )}
                    <Descoberta d={d} casoId={caso.id} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Painel de ação">
          <PainelAcoes acao={acao} setAcao={setAcao} />
        </aside>
      </main>

      <div className="hidden lg:block">
        <Rodape />
      </div>

      {tentativa.aguardandoConfirmacao && ultimoPasso && (
        <AvaliacaoMomento key={ultimoPasso.em} passo={ultimoPasso} />
      )}
    </div>
  )
}
