import { useMemo, useState } from 'react'
import { ROTULO } from '../componentes/Classificacao'
import type { Classificacao } from '../motor/tipos'
import type { Resumo } from './api'

const data = (ms: number | null) => (ms ? new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '–')
const duracao = (a: number | null, b: number | null) => (a && b ? `${Math.max(1, Math.round((b - a) / 60000))} min` : '–')

export function PainelTentativas({ resumo, recarregar }: { resumo: Resumo; recarregar: () => void }) {
  const [caso, setCaso] = useState('')
  const [aberta, setAberta] = useState<string | null>(null)
  const casos = [...new Set(resumo.tentativas.map((t) => t.casoId))].sort()
  const lista = useMemo(() => resumo.tentativas.filter((t) => !caso || t.casoId === caso), [resumo, caso])
  const concluidas = lista.filter((t) => t.desfecho)
  const notas = concluidas.map((t) => t.notaFinal).filter((n): n is number => typeof n === 'number')
  const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null

  return (
    <section aria-label="Tentativas" className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="block text-texto-2">Caso</span>
          <select
            value={caso}
            onChange={(e) => setCaso(e.target.value)}
            className="mt-1 min-h-11 rounded-sm border border-borda bg-superficie px-3 text-texto"
          >
            <option value="">Todos</option>
            {casos.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <dl className="numeros m-0 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-texto-2">Tentativas</dt>
            <dd className="m-0 text-lg font-semibold">{lista.length}</dd>
          </div>
          <div>
            <dt className="text-texto-2">Concluídas</dt>
            <dd className="m-0 text-lg font-semibold">{concluidas.length}</dd>
          </div>
          <div>
            <dt className="text-texto-2">Nota média</dt>
            <dd className="m-0 text-lg font-semibold">{media ?? '–'}</dd>
          </div>
        </dl>
        <button type="button" className="botao botao-secundario ml-auto" onClick={recarregar}>
          Atualizar
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="text-texto-2">Nenhuma tentativa ainda. Elas aparecem aqui assim que um aluno começa um caso.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="numeros w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-borda text-texto-2">
                <th className="py-2 pr-3 font-medium">Início</th>
                <th className="py-2 pr-3 font-medium">Caso</th>
                <th className="py-2 pr-3 font-medium">Aluno</th>
                <th className="py-2 pr-3 font-medium">Simulador</th>
                <th className="py-2 pr-3 font-medium">Tempo</th>
                <th className="py-2 pr-3 font-medium">Nota</th>
                <th className="py-2 pr-3 font-medium">Erros críticos</th>
                <th className="py-2 font-medium">Não previstas</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((t) => (
                <FilaTentativa key={t.id} t={t} aberta={aberta === t.id} alternar={() => setAberta(aberta === t.id ? null : t.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function FilaTentativa({ t, aberta, alternar }: { t: Resumo['tentativas'][number]; aberta: boolean; alternar: () => void }) {
  return (
    <>
      <tr className="border-b border-borda align-top">
        <td className="py-2.5 pr-3">
          <button type="button" onClick={alternar} aria-expanded={aberta} className="text-left underline underline-offset-4">
            {data(t.iniciadaEm)}
          </button>
        </td>
        <td className="py-2.5 pr-3">{t.casoId}</td>
        <td className="py-2.5 pr-3">{t.nomeInformado || <span className="text-texto-2">sem nome</span>}</td>
        <td className="py-2.5 pr-3">{t.modo === 'ia' ? 'Com IA' : 'Estático'}</td>
        <td className="py-2.5 pr-3">{duracao(t.iniciadaEm, t.finalizadaEm)}</td>
        <td className="py-2.5 pr-3 font-semibold">{t.desfecho ? (t.notaFinal ?? '–') : <span className="font-normal text-texto-2">em andamento</span>}</td>
        <td className="py-2.5 pr-3">{t.errosCriticos.length || ''}</td>
        <td className="py-2.5">{t.qtdNaoPrevistas || ''}</td>
      </tr>
      {aberta && (
        <tr className="border-b border-borda">
          <td colSpan={8} className="bg-superficie px-3 py-3">
            <ol className="m-0 space-y-2 pl-5">
              {t.passos.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold">{p.momento}</span>: {ROTULO[p.classificacao as Classificacao] ?? p.classificacao}
                  {p.textoDoAluno && <span className="block text-texto-2">“{p.textoDoAluno}”</span>}
                </li>
              ))}
              {t.passos.length === 0 && <li className="text-texto-2">Nenhuma conduta ainda.</li>}
            </ol>
            {t.errosCriticos.length > 0 && (
              <p className="m-0 mt-3 text-perigosa">Erros críticos: {t.errosCriticos.join(' | ')}</p>
            )}
            {t.desfecho && <p className="m-0 mt-2 text-texto-2">Desfecho: {t.desfecho}</p>}
          </td>
        </tr>
      )}
    </>
  )
}
