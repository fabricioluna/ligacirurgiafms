// Condutas não previstas, agrupadas por caso e momento, para o professor decidir
// se viram novos itens da folha resposta.

import { useState } from 'react'
import { buscarCaso } from '../dados/casos'
import { chamarPainel, type Resumo } from './api'

export function PainelNaoPrevistas({ resumo, recarregar }: { resumo: Resumo; recarregar: () => void }) {
  const [mostrarRevisadas, setMostrarRevisadas] = useState(false)
  const [erro, setErro] = useState('')
  // Marca na hora e confirma com o servidor; se falhar, volta atrás.
  const [locais, setLocais] = useState<Record<string, boolean>>({})
  const revisada = (n: { id: string; revisada: boolean }) => locais[n.id] ?? n.revisada
  const lista = resumo.naoPrevistas.filter((n) => mostrarRevisadas || !n.revisada)

  const grupos = new Map<string, Map<string, typeof lista>>()
  for (const n of lista) {
    if (!grupos.has(n.casoId)) grupos.set(n.casoId, new Map())
    const g = grupos.get(n.casoId)!
    g.set(n.momento, [...(g.get(n.momento) ?? []), n])
  }

  const marcar = async (id: string, valor: boolean) => {
    setLocais((l) => ({ ...l, [id]: valor }))
    setErro('')
    try {
      await chamarPainel('marcarRevisada', { id, revisada: valor })
    } catch (e) {
      setLocais((l) => ({ ...l, [id]: !valor }))
      setErro((e as Error).message)
    }
  }

  const nomeMomento = (casoId: string, codigo: string) =>
    buscarCaso(casoId)?.caso.momentos.find((m) => m.codigo === codigo)?.nome ?? codigo

  return (
    <section aria-label="Condutas não previstas" className="space-y-6">
      <p className="leitura m-0 text-texto-2">
        O que os alunos escreveram e não corresponde a nenhum item da folha resposta. Não contou ponto nem penalizou.
        Leia, decida se vale incluir como novo item da folha e marque como revisada.
      </p>
      <label className="flex min-h-11 items-center gap-2">
        <input type="checkbox" checked={mostrarRevisadas} onChange={(e) => setMostrarRevisadas(e.target.checked)} className="h-5 w-5 accent-[var(--verde)]" />
        Mostrar também as já revisadas
      </label>

      {erro && <p className="m-0 text-perigosa">{erro}</p>}
      {lista.length === 0 && <p className="text-texto-2">Nada para revisar.</p>}
      {Object.keys(locais).length > 0 && (
        <button type="button" className="botao botao-secundario" onClick={() => (setLocais({}), recarregar())}>
          Atualizar a lista
        </button>
      )}

      {[...grupos.entries()].map(([casoId, momentos]) => (
        <div key={casoId}>
          <h2 className="m-0 text-xl">{buscarCaso(casoId)?.caso.identificacao.titulo ?? casoId}</h2>
          {[...momentos.entries()].map(([momento, itens]) => (
            <div key={momento} className="mt-4">
              <h3 className="m-0 font-sans text-base font-semibold">
                {nomeMomento(casoId, momento)} <span className="font-normal text-texto-2">({itens.length})</span>
              </h3>
              <ul className="m-0 mt-2 list-none space-y-2 p-0">
                {itens.map((n) => (
                  <li key={n.id} className={`flex flex-wrap items-center gap-3 border border-borda p-3 ${revisada(n) ? 'opacity-60' : ''}`}>
                    <span className="min-w-0 flex-1">“{n.textoDoAluno}”</span>
                    <span className="text-xs text-texto-2">{n.em ? new Date(n.em).toLocaleDateString('pt-BR') : ''}</span>
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={revisada(n)}
                        onChange={(e) => marcar(n.id, e.target.checked)}
                        className="h-5 w-5 accent-[var(--verde)]"
                      />
                      Revisada
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
