// Discussão do caso no resultado do modo guiado: diagnóstico, raciocínio, diferenciais, caminho esperado,
// mensagens para levar e referências. Tudo vem do arquivo do caso e da folha resposta.

import type { Caso } from '../motor/tipos'

export function DiagnosticoDoCaso({ caso }: { caso: Caso }) {
  const dx = caso.folhaResposta.diagnostico
  if (!dx) return null
  return (
    <section aria-labelledby="t-diagnostico" className="mt-10 space-y-6">
      <div className="border-l-4 border-verde pl-5">
        <h2 id="t-diagnostico" className="m-0 font-sans text-sm font-semibold text-texto-2">
          Diagnóstico
        </h2>
        <p className="m-0 mt-1 text-lg font-semibold">{dx.correto}</p>
      </div>
      <div>
        <h3 className="m-0 font-sans text-base font-semibold">Como chegar ao diagnóstico</h3>
        <ol className="leitura m-0 mt-2 space-y-2 pl-5">
          {dx.raciocinio.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>
      <div>
        <h3 className="m-0 font-sans text-base font-semibold">Diagnósticos diferenciais e como afastar cada um</h3>
        <dl className="leitura m-0 mt-2 space-y-3">
          {dx.diferenciais.map((d) => (
            <div key={d.diagnostico}>
              <dt className="font-semibold">{d.diagnostico}</dt>
              <dd className="m-0 text-texto-2">{d.comoAfastar}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function FechamentoDoCaso({ caso }: { caso: Caso }) {
  const fr = caso.folhaResposta
  const refs = caso.caso.identificacao.referencias ?? []
  return (
    <section aria-labelledby="t-fechamento" className="mt-12 space-y-8">
      <h2 id="t-fechamento" className="m-0 text-xl">
        Para levar deste caso
      </h2>
      <div>
        <h3 className="m-0 font-sans text-base font-semibold">O caminho esperado</h3>
        <p className="leitura mt-2 mb-0">{fr.caminhoIdeal}</p>
      </div>
      <div>
        <h3 className="m-0 font-sans text-base font-semibold">Mensagens principais</h3>
        <ul className="leitura m-0 mt-2 space-y-2 pl-5">
          {fr.mensagensChave.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="m-0 font-sans text-base font-semibold">O que este caso treina</h3>
        <ul className="leitura m-0 mt-2 space-y-2 pl-5">
          {fr.objetivos.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
      {refs.length > 0 && (
        <div>
          <h3 className="m-0 font-sans text-base font-semibold">Referências</h3>
          <ul className="m-0 mt-2 space-y-1 pl-5 text-sm text-texto-2">
            {refs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
