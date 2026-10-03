// Discussão do caso no relatório: diagnóstico, como chegar nele, diferenciais
// e a linha de raciocínio momento a momento. Tudo vem da folha resposta.

import { ehDesfecho, momento, momentoFolha } from '../motor/caso'
import { ROTULO_DIAGNOSTICO } from '../motor/diagnostico'
import type { Caso, Tentativa } from '../motor/tipos'

const COR = { correto: 'var(--c-ideal)', parcial: 'var(--c-subotima)', incorreto: 'var(--c-perigosa)' }

export function DiscussaoCaso({ caso, t }: { caso: Caso; t: Tentativa }) {
  const dx = caso.folhaResposta.diagnostico
  const ideal: string[] = []
  let cod: string | undefined = caso.caso.momentos[0].codigo
  while (cod && !ehDesfecho(cod) && !ideal.includes(cod)) {
    ideal.push(cod)
    cod = momento(caso, cod).proximo
  }

  return (
    <section aria-labelledby="t-discussao" className="space-y-8">
      <h2 id="t-discussao" className="m-0 text-2xl">Discussão do caso</h2>

      {dx && (
        <div className="space-y-5">
          <div className="border-l-4 border-verde pl-5">
            <p className="m-0 text-sm text-texto-2">Diagnóstico</p>
            <p className="m-0 mt-1 text-lg font-semibold">{dx.correto}</p>
            {t.diagnostico && (
              <p className="m-0 mt-3">
                Sua hipótese: “{t.diagnostico.texto}”{' '}
                <span className="font-semibold" style={{ color: COR[t.diagnostico.classificacao] }}>
                  ({ROTULO_DIAGNOSTICO[t.diagnostico.classificacao].toLowerCase()})
                </span>
              </p>
            )}
          </div>

          <div>
            <h3 className="m-0 font-sans text-base font-semibold">Como chegar ao diagnóstico</h3>
            <ol className="leitura m-0 mt-2 space-y-2 pl-5">
              {dx.raciocinio.map((r) => <li key={r}>{r}</li>)}
            </ol>
          </div>

          <div>
            <h3 className="m-0 font-sans text-base font-semibold">Diagnósticos diferenciais</h3>
            <dl className="leitura m-0 mt-2 space-y-3">
              {dx.diferenciais.map((d) => (
                <div key={d.diagnostico}>
                  <dt className="font-semibold">{d.diagnostico}</dt>
                  <dd className="m-0 text-texto-2">{d.comoAfastar}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <div>
        <h3 className="m-0 font-sans text-base font-semibold">A linha de raciocínio, momento a momento</h3>
        <div className="mt-3 space-y-2">
          {ideal.map((c, i) => {
            const f = momentoFolha(caso, c)
            const seu = t.passos.find((p) => p.momento === c)
            return (
              <details key={c} open={i === 0} className="border border-borda bg-superficie">
                <summary className="flex min-h-11 cursor-pointer items-center px-4 py-2 font-semibold">{momento(caso, c).nome}</summary>
                <div className="leitura space-y-4 px-4 pb-4">
                  {f.pontosDeRaciocinio?.length ? (
                    <div>
                      <p className="m-0 text-sm text-texto-2">O que pensar</p>
                      <ul className="m-0 mt-1 space-y-1.5 pl-5">{f.pontosDeRaciocinio.map((p) => <li key={p}>{p}</li>)}</ul>
                    </div>
                  ) : null}
                  <div>
                    <p className="m-0 text-sm text-texto-2">O que fazer</p>
                    <ul className="m-0 mt-1 space-y-1.5 pl-5">{f.ideal.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                  <div>
                    <p className="m-0 text-sm text-texto-2">Por quê</p>
                    <ul className="m-0 mt-1 space-y-1.5 pl-5">{f.justificativa.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                  {!seu && <p className="m-0 text-sm text-texto-2">Seu atendimento não passou por este momento.</p>}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </section>
  )
}
