// Prontuário do modo guiado: história, exame físico e resultados de exames, tudo vindo do arquivo do caso.

import { VisualizadorImagem } from '../componentes/VisualizadorImagem'
import { exameFisicoAtual } from '../motor/caso'
import type { Caso, Exame, ItemExameFisico } from '../motor/tipos'

// História e exame físico. Na admissão vem aberto; depois fica recolhido, para consulta.
export function Prontuario({ caso, caminho, aberto }: { caso: Caso; caminho: string[]; aberto: boolean }) {
  const quem = caso.caso.paciente?.acompanhante ? `O paciente e ${caso.caso.paciente.acompanhante} contam` : 'O que o paciente conta'
  return (
    <div className="mt-6 space-y-3">
      <details open={aberto} className="border border-borda bg-superficie">
        <summary className="cursor-pointer px-4 py-3 font-semibold">História clínica</summary>
        <div className="leitura border-t border-borda px-4 pt-2 pb-4">
          <p className="m-0 text-sm text-texto-2">{quem}:</p>
          <dl className="m-0">
            {caso.caso.anamnese.map((a) => (
              <div key={a.id} className="mt-3">
                <dt className="text-sm font-semibold text-texto-2">{a.tema}</dt>
                <dd className="m-0">“{a.resposta}”</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
      <details open={aberto} className="border border-borda bg-superficie">
        <summary className="cursor-pointer px-4 py-3 font-semibold">Exame físico</summary>
        <div className="border-t border-borda px-4 pt-1 pb-4">
          <AchadosExameFisico itens={exameFisicoAtual(caso, caminho)} />
        </div>
      </details>
    </div>
  )
}

export function AchadosExameFisico({ itens }: { itens: ItemExameFisico[] }) {
  return (
    <dl className="leitura m-0">
      {itens.map((x) => (
        <div key={x.id} className="mt-3">
          <dt className="text-sm font-semibold text-texto-2">{x.segmento}</dt>
          <dd className="m-0">{x.achado}</dd>
        </div>
      ))}
    </dl>
  )
}

// Resultados de exames: laboratório em lista compacta, imagem com laudo e miniatura que amplia.
export function ResultadosExames({ casoId, exames, novos }: { casoId: string; exames: Exame[]; novos?: Set<string> }) {
  return (
    <ul className="m-0 list-none space-y-3 p-0">
      {exames.map((e) => (
        <li key={e.id} className="border border-borda bg-superficie p-4">
          <p className="m-0 flex flex-wrap items-center gap-2 font-semibold">
            {e.nome}
            {novos?.has(e.id) && <span className="bg-verde-suave px-2 py-0.5 text-xs font-semibold text-verde-texto">novo</span>}
          </p>
          <p className="laudo numeros mt-1 mb-0">{e.resultado}</p>
          {e.imagem && (
            <div className="mt-3">
              <VisualizadorImagem casoId={casoId} imagem={e.imagem} />
              {e.imagem.legenda && <p className="m-0 mt-1 text-sm text-texto-2">{e.imagem.legenda}. Toque para ampliar.</p>}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
