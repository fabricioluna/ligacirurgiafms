// Modo guiado: uma decisão por vez, com até 6 alternativas e a reação do caso na hora.
// Funciona sem internet e não usa a tentativa dos outros dois modos.

import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { apagar, gravar, ler } from '../armazenamento'
import { SeloClassificacao, corDaClassificacao } from '../componentes/Classificacao'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { SinaisVitais } from '../componentes/SinaisVitais'
import { QUALIDADE } from '../telas/Desfecho'
import { desfecho, momento, momentoFolha, sinaisVitaisAtuais } from '../motor/caso'
import type { Caso, Classificacao } from '../motor/tipos'
import { useTentativa } from '../tentativa'
import {
  continuar,
  efeitosDoPasso,
  escolhasDoPasso,
  escolher,
  notaGuiada,
  novoEstado,
  passoDoRoteiro,
  rotuloDaOpcao,
  tambemCertas,
} from './motor'
import { roteiroDoCaso } from './roteiros'
import type { EstadoGuiado, Roteiro } from './tipos'

const chave = (casoId: string) => `simulador:guiado:${casoId}`

export function estadoGuiadoSalvo(caso: Caso): EstadoGuiado | null {
  const e = ler<EstadoGuiado>(chave(caso.id))
  // Estado de outra versão do caso pode não bater com o arquivo atual: descarta.
  return e && e.versaoCaso === caso.versao ? e : null
}

export function apagarEstadoGuiado(casoId: string) {
  apagar(chave(casoId))
}

// Chamado pela abertura do caso: começa do zero ou retoma o que estava salvo.
export function iniciarGuiado(caso: Caso, nome: string, retomar: boolean) {
  const roteiro = roteiroDoCaso(caso)
  if (!roteiro) return
  const salvo = retomar ? estadoGuiadoSalvo(caso) : null
  if (!salvo || salvo.desfecho) gravar(chave(caso.id), novoEstado(caso, roteiro, nome))
}

const TITULO_RESPOSTA: Record<Classificacao, string> = {
  ideal: 'No caminho certo',
  aceitavel: 'Funciona, mas existe opção melhor',
  subotima: 'Atenção: essa decisão tem custo',
  perigosa: 'Erro crítico',
  nao_prevista: '',
}

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

export function TelaGuiada() {
  const { caso } = useTentativa()
  const roteiro = roteiroDoCaso(caso)
  const [estado, setEstado] = useState<EstadoGuiado | null>(() => estadoGuiadoSalvo(caso))

  useEffect(() => {
    if (estado) gravar(chave(caso.id), estado)
  }, [caso.id, estado])

  if (!roteiro || !estado) return <Navigate to={`/caso/${caso.id}`} replace />
  return (
    <Corpo
      caso={caso}
      roteiro={roteiro}
      estado={estado}
      setEstado={setEstado}
      recomecar={() => setEstado(novoEstado(caso, roteiro, estado.nomeInformado))}
    />
  )
}

function Corpo(props: {
  caso: Caso
  roteiro: Roteiro
  estado: EstadoGuiado
  setEstado: (e: EstadoGuiado) => void
  recomecar: () => void
}) {
  const { caso, roteiro, estado, setEstado } = props
  const respostaRef = useRef<HTMLDivElement>(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [estado.passo, estado.desfecho])

  useEffect(() => {
    if (estado.resposta) respostaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [estado.resposta])

  if (estado.desfecho) return <Resultado caso={caso} roteiro={roteiro} estado={estado} recomecar={props.recomecar} />

  const m = momento(caso, estado.passo)
  const passo = passoDoRoteiro(roteiro, estado.passo)
  const feitas = escolhasDoPasso(estado)
  const efeitos = efeitosDoPasso(caso, estado)
  const primeiro = estado.caminho.length === 1
  const resposta = estado.resposta
  const travado = Boolean(resposta?.avancou)
  const sinais = sinaisVitaisAtuais(caso, estado.caminho, efeitos)

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho>
        <p className="m-0 truncate text-sm text-texto-2">Modo guiado · decisão {estado.caminho.length}</p>
      </Cabecalho>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-16">
        {m.tempo && <p className="m-0 mb-1 text-sm text-texto-2">{m.tempo}</p>}
        <h1 className="m-0 text-2xl">{m.nome}</h1>
        <p className="leitura mt-4 mb-0">{primeiro ? caso.caso.apresentacaoInicial.texto : m.situacao}</p>

        {efeitos.length > 0 && (
          <div className="leitura mt-4 border-l-2 border-verde pl-4">
            <p className="m-0 text-sm font-semibold text-texto-2">Depois do que você fez</p>
            {efeitos.map((e) => (
              <p key={e.item} className="m-0 mt-1">
                {e.texto}
              </p>
            ))}
          </div>
        )}

        {(primeiro || Boolean(m.sinaisVitais?.length) || efeitos.some((e) => e.sinaisVitais?.length)) && (
          <>
            <h2 className="mt-6 mb-2 font-sans text-sm font-semibold text-texto-2">Sinais vitais</h2>
            <SinaisVitais sinais={sinais} />
          </>
        )}

        <p className="mt-8 mb-0 font-titulo text-xl font-semibold text-verde-texto">
          {primeiro ? caso.caso.apresentacaoInicial.pergunta : m.pergunta}
        </p>
        <p className="mt-1 mb-4 text-sm text-texto-2">Escolha uma alternativa. Pode haver mais de uma certa.</p>

        <ul className="m-0 grid list-none gap-3 p-0">
          {passo.opcoes.map((o, i) => {
            const feita = feitas.find((x) => x.item === o.item)
            const bloqueada = Boolean(feita) || travado
            return (
              <li key={o.item}>
                <button
                  type="button"
                  disabled={bloqueada}
                  onClick={() => setEstado(escolher(caso, roteiro, estado, o.item))}
                  className="flex min-h-14 w-full items-start gap-3 rounded-sm border-2 bg-superficie p-4 text-left text-texto enabled:hover:border-texto-2 disabled:cursor-default"
                  style={{
                    borderColor: feita ? corDaClassificacao(feita.classificacao) : 'var(--borda)',
                    opacity: bloqueada && !feita ? 0.5 : 1,
                  }}
                >
                  <span className="font-titulo text-xl leading-none font-bold text-texto-2" aria-hidden="true">
                    {LETRAS[i]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">{rotuloDaOpcao(caso, estado.passo, o.item)}</span>
                    {feita && (
                      <span className="mt-2 block">
                        <SeloClassificacao c={feita.classificacao} />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {resposta && (
          <div
            ref={respostaRef}
            role="status"
            className="leitura mt-6 border-2 bg-superficie p-5"
            style={{ borderColor: corDaClassificacao(resposta.classificacao) }}
          >
            <p className="m-0 flex flex-wrap items-center gap-x-2 font-semibold" style={{ color: corDaClassificacao(resposta.classificacao) }}>
              <SeloClassificacao c={resposta.classificacao} grande />
              <span>{TITULO_RESPOSTA[resposta.classificacao]}</span>
            </p>
            <p className="mt-3 mb-0">{resposta.consequencia ?? 'Era o que se esperava neste momento.'}</p>
            {resposta.avancou ? (
              <button type="button" className="botao botao-principal mt-5 w-full sm:w-auto" onClick={() => setEstado(continuar(estado))}>
                Continuar
              </button>
            ) : (
              <p className="m-0 mt-4 text-sm text-texto-2">O caso ainda não avançou. Escolha outra alternativa.</p>
            )}
          </div>
        )}

        <div className="mt-10">
          {confirmarSaida ? (
            <p className="m-0">
              Sair do modo guiado? Seu progresso fica salvo neste aparelho.{' '}
              <Link to={`/caso/${caso.id}`} className="text-verde-texto underline underline-offset-4">
                Sair
              </Link>{' '}
              ·{' '}
              <button type="button" className="text-verde-texto underline underline-offset-4" onClick={() => setConfirmarSaida(false)}>
                Ficar
              </button>
            </p>
          ) : (
            <button type="button" className="text-sm text-texto-2 underline underline-offset-4" onClick={() => setConfirmarSaida(true)}>
              Sair do modo guiado
            </button>
          )}
        </div>
      </main>
      <Rodape />
    </div>
  )
}

function Resultado(props: { caso: Caso; roteiro: Roteiro; estado: EstadoGuiado; recomecar: () => void }) {
  const { caso, roteiro, estado } = props
  const d = desfecho(caso, estado.desfecho!)
  const q = d.qualidade ? QUALIDADE[d.qualidade] : null
  const nota = notaGuiada(caso, estado)

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        {q && (
          <p className="m-0 flex items-center gap-3 font-semibold" style={{ color: q.cor }}>
            <span className="inline-block h-0.5 w-10" style={{ background: q.cor }} aria-hidden="true" />
            {q.rotulo}
          </p>
        )}
        <h1 className="mt-3 mb-0 text-lg text-texto-2">O que aconteceu com o paciente</h1>
        <p className="leitura mt-4 mb-0 font-titulo text-2xl leading-tight font-semibold sm:text-3xl">{d.texto}</p>

        {nota.final !== null && (
          <p className="mt-8 mb-0">
            <span className="numeros font-titulo text-5xl font-bold">{nota.final}</span>
            <span className="text-texto-2"> / 100</span>
            {nota.faixa && <span className="ml-3 font-semibold text-verde-texto">{nota.faixa}</span>}
          </p>
        )}

        <h2 className="mt-10 mb-4 text-xl">Suas decisões</h2>
        <ol className="m-0 list-none space-y-8 p-0">
          {estado.caminho
            .filter((p) => estado.escolhas.some((x) => x.passo === p))
            .map((p) => {
              const f = momentoFolha(caso, p)
              const feitas = escolhasDoPasso({ ...estado, passo: p })
              const outras = tambemCertas(caso, estado, roteiro, p)
              return (
                <li key={p} className="leitura">
                  <h3 className="m-0 mb-2 font-sans text-base font-semibold">{momento(caso, p).nome}</h3>
                  <ul className="m-0 list-none space-y-2 p-0">
                    {feitas.map((x) => (
                      <li key={x.item} className="border-l-4 pl-3" style={{ borderColor: corDaClassificacao(x.classificacao) }}>
                        <SeloClassificacao c={x.classificacao} />
                        <span className="mt-0.5 block">{rotuloDaOpcao(caso, p, x.item)}</span>
                      </li>
                    ))}
                  </ul>
                  {outras.length > 0 && (
                    <div className="mt-3">
                      <p className="m-0 text-sm font-semibold text-texto-2">Também estava certo</p>
                      <ul className="m-0 mt-1 space-y-1 pl-5">
                        {outras.map((i) => (
                          <li key={i}>{rotuloDaOpcao(caso, p, i)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {f.justificativa.length > 0 && <p className="m-0 mt-3 text-sm text-texto-2">Por quê: {f.justificativa.join(' ')}</p>}
                </li>
              )
            })}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" className="botao botao-principal" onClick={props.recomecar}>
            Jogar de novo
          </button>
          <Link to={`/caso/${caso.id}`} className="botao botao-secundario">
            Voltar ao caso
          </Link>
        </div>
      </main>
      <Rodape />
    </div>
  )
}
