// Relatório final. No modo sem IA, todo texto vem fixo da folha resposta.

import { Link, Navigate, useNavigate } from 'react-router'
import { SeloClassificacao } from '../componentes/Classificacao'
import { ComentarioPreceptor } from '../componentes/ComentarioPreceptor'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { ProgressoSutura } from '../componentes/ProgressoSutura'
import { codigoBase, desfecho, ehDesfecho, momento } from '../motor/caso'
import { calcularNota } from '../motor/nota'
import { useTentativa } from '../tentativa'
import { QUALIDADE } from './Desfecho'

const formatarData = (ms: number) =>
  new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const duracao = (ms: number) => {
  const min = Math.max(1, Math.round(ms / 60000))
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}

export function Relatorio() {
  const { caso, tentativa, descartar, iniciar } = useTentativa()
  const navegar = useNavigate()
  if (!tentativa?.desfecho) return <Navigate to={`/caso/${caso.id}`} replace />

  const t = tentativa
  const nota = calcularNota(caso, t.passos)
  const d = desfecho(caso, t.desfecho!)
  const q = d.qualidade ? QUALIDADE[d.qualidade] : null
  const folha = caso.folhaResposta
  const pesoJogado = nota.porMomento.reduce((s, m) => s + m.peso, 0)

  // Caminho ideal: os momentos principais, seguindo o próximo de cada um.
  const ideal: string[] = []
  let cod: string | undefined = caso.caso.momentos[0].codigo
  while (cod && !ehDesfecho(cod) && !ideal.includes(cod)) {
    ideal.push(cod)
    cod = momento(caso, cod).proximo
  }
  const desfechoIdeal = cod

  const erros = t.passos.flatMap((p) =>
    p.errosCriticos.map((e) => ({
      momento: p.momento,
      erro: e,
      consequencia: p.regraAplicada ? caso.caso.regras.find((r) => r.codigo === p.regraAplicada)?.entao : undefined,
    })),
  )
  const custos = t.passos.flatMap((p) => p.subotimas.map((s) => ({ momento: p.momento, ...s })))

  const refazer = () => {
    descartar()
    iniciar(t.nomeInformado, t.modo)
    navegar(`/caso/${caso.id}/atendimento`)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <main className="flex-1">
        <section className="textura border-b border-borda">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[auto_1fr] sm:items-end">
            <div>
              <p className="m-0 text-sm text-texto-2">Nota</p>
              <p className="numeros m-0 font-titulo text-[6rem] leading-none font-bold sm:text-[8rem]">
                {nota.final ?? '–'}
              </p>
              {nota.faixa && <p className="m-0 mt-1 text-lg font-semibold text-verde-texto">{nota.faixa}</p>}
            </div>
            <div className="min-w-0">
              <h1 className="m-0 text-xl uppercase sm:text-2xl">{caso.caso.identificacao.titulo}</h1>
              <p className="mt-2 mb-0 font-semibold">{caso.caso.identificacao.tema}</p>
              <p className="mt-2 mb-0 text-sm text-texto-2">
                {t.nomeInformado && <>{t.nomeInformado}. </>}
                {t.modo === 'ia' ? 'Simulador com IA' : 'Simulador estático'}. 
                {formatarData(t.iniciadaEm)}
                {t.finalizadaEm && <>. Duração: {duracao(t.finalizadaEm - t.iniciadaEm)}</>}.
              </p>
              {pesoJogado < 100 && (
                <p className="mt-3 mb-0 text-sm text-texto-2">
                  O caso terminou antes do último momento. A nota considera só os momentos que você jogou.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl space-y-12 px-4 py-10">
          <section aria-labelledby="t-desfecho">
            <h2 id="t-desfecho" className="m-0 text-xl">Desfecho</h2>
            {q && <p className="mt-3 mb-0 font-semibold" style={{ color: q.cor }}>{q.rotulo}</p>}
            <p className="leitura mt-1 mb-0">{d.texto}</p>
          </section>

          {t.modo === 'ia' && <ComentarioPreceptor />}

          {erros.length > 0 && (
            <section aria-labelledby="t-erros" className="border-l-4 border-perigosa pl-5">
              <h2 id="t-erros" className="m-0 text-xl text-perigosa">Erros críticos</h2>
              <ul className="leitura m-0 mt-4 list-none space-y-4 p-0">
                {erros.map((e, i) => (
                  <li key={i}>
                    <p className="m-0 text-sm text-texto-2">{momento(caso, e.momento).nome}</p>
                    <p className="m-0 font-medium">{e.erro}</p>
                    {e.consequencia && <p className="m-0 text-texto-2">{e.consequencia}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="t-momentos">
            <h2 id="t-momentos" className="m-0 text-xl">Nota por momento</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="numeros w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-borda text-sm text-texto-2">
                    <th className="py-2 pr-4 font-medium">Momento</th>
                    <th className="py-2 pr-4 font-medium">Classificação</th>
                    <th className="py-2 text-right font-medium">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {t.passos.map((p, i) => {
                    const n = nota.porMomento[i]
                    return (
                      <tr key={i} className="border-b border-borda align-top">
                        <td className="py-3 pr-4">{momento(caso, p.momento).nome}</td>
                        <td className="py-3 pr-4"><SeloClassificacao c={p.classificacao} /></td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {n.pontos === null ? '–' : `${n.pontos} de ${n.peso}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="t-caminho">
            <h2 id="t-caminho" className="m-0 text-xl">Seu caminho e o caminho ideal</h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="m-0 font-sans text-base font-semibold">Seu caminho</h3>
                <ProgressoSutura
                  className="mt-3"
                  pontos={ideal.map((c) => ({
                    rotulo: momento(caso, c).nome,
                    estado: t.passos.some((p) => codigoBase(p.momento) === c) ? 'fechado' : 'futuro',
                  }))}
                />
                <ol className="m-0 mt-3 space-y-1 pl-5">
                  {t.caminho.map((c) => <li key={c}>{momento(caso, c).nome}</li>)}
                  <li>{q ? q.rotulo : `Desfecho ${d.codigo}`}</li>
                </ol>
              </div>
              <div>
                <h3 className="m-0 font-sans text-base font-semibold">Caminho ideal</h3>
                <ol className="m-0 mt-3 space-y-1 pl-5">
                  {ideal.map((c) => <li key={c}>{momento(caso, c).nome}</li>)}
                  {desfechoIdeal && ehDesfecho(desfechoIdeal) && (
                    <li>{QUALIDADE[desfecho(caso, desfechoIdeal).qualidade ?? '']?.rotulo ?? desfechoIdeal}</li>
                  )}
                </ol>
                <p className="leitura mt-4 mb-0 text-texto-2">{folha.caminhoIdeal}</p>
              </div>
            </div>
          </section>

          {custos.length > 0 && (
            <section aria-labelledby="t-custos">
              <h2 id="t-custos" className="m-0 text-xl">O que custou tempo, risco ou recurso</h2>
              <ul className="leitura m-0 mt-4 list-none space-y-4 p-0">
                {custos.map((c, i) => (
                  <li key={i}>
                    <p className="m-0 text-sm text-texto-2">{momento(caso, c.momento).nome}</p>
                    <p className="m-0">{c.conduta}</p>
                    <p className="m-0 text-texto-2">Custo: {c.custo}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {t.naoPrevistas.length > 0 && (
            <section aria-labelledby="t-nao-previstas">
              <h2 id="t-nao-previstas" className="m-0 text-xl">Condutas não previstas</h2>
              <p className="leitura mt-2 mb-0 text-texto-2">
                Não contam ponto nem penalizam. Ficam registradas para o professor revisar e, se for o caso, incluir na folha resposta.
              </p>
              <ul className="leitura m-0 mt-4 list-none space-y-3 p-0">
                {t.naoPrevistas.map((n, i) => (
                  <li key={i}>
                    <p className="m-0 text-sm text-texto-2">{momento(caso, n.momento).nome}</p>
                    <p className="m-0">{n.texto}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="t-objetivos">
            <h2 id="t-objetivos" className="m-0 text-xl">O que este caso treinou</h2>
            <ul className="leitura m-0 mt-4 space-y-2 pl-5">
              {folha.objetivos.map((o) => <li key={o}>{o}</li>)}
            </ul>
          </section>

          <section aria-labelledby="t-mensagens">
            <h2 id="t-mensagens" className="m-0 text-xl">Para levar deste caso</h2>
            <ul className="leitura m-0 mt-4 space-y-2 pl-5">
              {folha.mensagensChave.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </section>

          {(caso.caso.identificacao.referencias ?? []).length > 0 && (
            <section aria-labelledby="t-referencias">
              <h2 id="t-referencias" className="m-0 text-xl">Referências</h2>
              <ul className="leitura m-0 mt-4 space-y-2 pl-5 text-sm">
                {caso.caso.identificacao.referencias!.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          )}

          <div className="nao-imprimir flex flex-wrap gap-3 border-t border-borda pt-8">
            <button type="button" className="botao botao-principal" onClick={refazer}>Refazer o caso</button>
            <button type="button" className="botao botao-secundario" onClick={() => window.print()}>Baixar em PDF</button>
            <Link to="/" className="botao botao-secundario">Voltar ao início</Link>
          </div>
        </div>
      </main>
      <Rodape />
    </div>
  )
}
