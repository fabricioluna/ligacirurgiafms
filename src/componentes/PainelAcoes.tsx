// Painel de ação: perguntar, examinar, pedir exame e definir conduta.
// Na Fase 1 são listas vindas do caso; na Fase 2 o campo de texto livre entra aqui.
// No celular abre como folha sobre a tela; no computador fica fixo ao lado.

import { useEffect, useMemo, useRef, useState } from 'react'
import { acoesDisponiveis, exameDisponivel, exameFisicoAtual, examesAtuais, momento } from '../motor/caso'
import { opcoesDoMomento } from '../motor/avaliacao'
import type { Acao, Descoberta as TDescoberta } from '../motor/tipos'
import { useTentativa } from '../tentativa'
import { Descoberta } from './Descoberta'
import { HipoteseDiagnostica } from './HipoteseDiagnostica'
import { precisaDiagnostico } from '../motor/diagnostico'

// Painéis: as ações do momento e, quando o caso pede, a hipótese diagnóstica (sempre por último).
export type Painel = Acao | 'hipotese'

export const NOME_ACAO: Record<Painel, string> = {
  anamnese: 'Perguntar ao paciente',
  exameFisico: 'Examinar',
  exames: 'Pedir exame',
  conduta: 'Definir conduta',
  hipotese: 'Hipótese diagnóstica',
}

// No computador o painel fica sempre aberto ao lado; no celular o atalho ativo fecha a folha.
const ehComputador = () => window.matchMedia('(min-width: 1024px)').matches

interface Props {
  acao: Painel | null
  setAcao: (a: Painel | null) => void
  // No simulador com IA, os atalhos ficam no campo de texto e o painel só mostra a lista.
  semBarra?: boolean
}

export function PainelAcoes({ acao, setAcao, semBarra = false }: Props) {
  const { caso, tentativa, definirConduta } = useTentativa()
  const m = momento(caso, tentativa!.momentoAtual)
  const disponiveis = acoesDisponiveis(m)
  const pedeHipotese = precisaDiagnostico(caso, tentativa!)
  const paineis: Painel[] = pedeHipotese ? [...disponiveis, 'hipotese'] : disponiveis
  const aberta = acao && paineis.includes(acao) ? acao : null
  const painel = useRef<HTMLDivElement>(null)
  // Conduta marcada antes da hipótese: confirma assim que a hipótese for registrada.
  const [condutaPendente, setCondutaPendente] = useState<string[] | null>(null)

  const confirmarConduta = (marcados: string[]) => {
    if (pedeHipotese) {
      setCondutaPendente(marcados)
      setAcao('hipotese')
      return
    }
    definirConduta(marcados)
  }

  const hipoteseRegistrada = () => {
    if (condutaPendente) {
      definirConduta(condutaPendente)
      setCondutaPendente(null)
    } else setAcao('conduta')
  }

  useEffect(() => {
    if (!aberta) return
    const fechar = (e: KeyboardEvent) => e.key === 'Escape' && setAcao(null)
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [aberta, setAcao])

  useEffect(() => {
    if (aberta && !ehComputador()) painel.current?.focus()
  }, [aberta])

  return (
    <>
      {/* Barra de atalhos: fixa embaixo no celular, no topo do painel no computador. */}
      {!semBarra && <nav
        aria-label="Ações"
        className="nao-imprimir fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-fundo px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0"
      >
        <div className={`mx-auto grid max-w-xl gap-1.5 lg:max-w-none lg:grid-cols-2 lg:gap-2 ${paineis.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {paineis.map((a) => (
            <BotaoAcao key={a} a={a} ativa={aberta === a} onClick={() => setAcao(aberta === a && !ehComputador() ? null : a)} />
          ))}
        </div>
        {disponiveis.length === 1 && (
          <p className="m-0 hidden pt-3 text-sm text-texto-2 lg:block">Neste momento, só a conduta está disponível.</p>
        )}
      </nav>}

      {aberta && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setAcao(null)} aria-hidden="true" />
      )}
      <div
        ref={painel}
        tabIndex={-1}
        role="region"
        aria-label={aberta ? NOME_ACAO[aberta] : undefined}
        className={`${aberta ? 'flex' : 'hidden'} fixed inset-x-0 bottom-0 z-40 max-h-[88dvh] flex-col rounded-t-sm border-t border-borda bg-superficie outline-none lg:static lg:mt-4 lg:max-h-[calc(100dvh-12rem)] lg:rounded-sm lg:border`}
      >
        {aberta && (
          <div className="flex items-center justify-between gap-3 border-b border-borda px-4 py-2">
            <h2 className="m-0 font-sans text-base font-semibold">{NOME_ACAO[aberta]}</h2>
            <button type="button" className="botao -mr-3 min-h-11 px-3 text-texto-2 lg:hidden" onClick={() => setAcao(null)}>
              Fechar
            </button>
          </div>
        )}
        {/* As listas ficam montadas: fechar o painel não perde o que o aluno já marcou. */}
        {paineis.map((a) => (
          <div key={a + m.codigo} className={aberta === a ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            {a === 'hipotese' ? (
              <HipoteseDiagnostica
                aviso={condutaPendente ? 'Para confirmar a conduta, registre antes a sua hipótese diagnóstica.' : undefined}
                aoRegistrar={hipoteseRegistrada}
              />
            ) : a === 'conduta' ? (
              <ListaConduta aoConfirmar={confirmarConduta} />
            ) : (
              <ListaDescoberta tipo={a} />
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function BotaoAcao({ a, ativa, onClick }: { a: Painel; ativa: boolean; onClick: () => void }) {
  const conduta = a === 'conduta'
  const curto: Record<Painel, string> = { anamnese: 'Perguntar', exameFisico: 'Examinar', exames: 'Pedir exame', conduta: 'Conduta', hipotese: 'Hipótese' }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      className={`flex min-h-12 flex-col items-center justify-center rounded-sm px-1 text-xs leading-tight font-semibold sm:text-sm lg:flex-row lg:justify-start lg:px-3 lg:text-left ${
        conduta
          ? 'bg-verde text-sobre-verde hover:bg-verde-texto'
          : ativa
            ? 'border border-verde bg-verde-suave text-texto'
            : 'border border-borda text-texto hover:border-texto-2'
      } ${conduta && ativa ? 'ring-2 ring-verde-texto ring-offset-2 ring-offset-fundo' : ''}`}
    >
      <span className="lg:hidden">{curto[a]}</span>
      <span className="hidden lg:inline">{NOME_ACAO[a]}</span>
    </button>
  )
}

function ListaDescoberta({ tipo }: { tipo: 'anamnese' | 'exameFisico' | 'exames' }) {
  const { caso, tentativa, revelar } = useTentativa()
  const t = tentativa!
  const [ultima, setUltima] = useState<string | null>(null)

  const itens = useMemo(() => {
    if (tipo === 'anamnese') return caso.caso.anamnese.map((a) => ({ id: a.id, nome: a.tema }))
    if (tipo === 'exameFisico') return exameFisicoAtual(caso, t.caminho).map((e) => ({ id: e.id, nome: e.segmento }))
    return examesAtuais(caso, t.caminho)
      .filter((e) => exameDisponivel(caso, e, t.momentoAtual))
      .map((e) => ({ id: e.id, nome: e.nome }))
  }, [caso, t.caminho, t.momentoAtual, tipo])

  const nesteMomento = new Set(t.descobertas.filter((d) => d.momento === t.momentoAtual).map((d) => d.id))
  const antes = new Set(t.descobertas.filter((d) => d.momento !== t.momentoAtual).map((d) => d.id))
  const resposta: TDescoberta | undefined = ultima
    ? t.descobertas.findLast((d) => d.id === ultima && d.momento === t.momentoAtual)
    : undefined

  const escolher = (id: string) => {
    revelar(tipo, id)
    setUltima(id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {resposta && (
        <div className="max-h-[38dvh] shrink-0 lg:max-h-[45%] overflow-y-auto border-b border-borda p-4" aria-live="polite">
          <Descoberta d={resposta} casoId={caso.id} />
        </div>
      )}
      <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2">
        {itens.map((i) => {
          const feito = nesteMomento.has(i.id)
          return (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => escolher(i.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left hover:bg-fundo ${ultima === i.id ? 'bg-fundo' : ''}`}
              >
                <span>{i.nome}</span>
                {feito ? (
                  <span className="shrink-0 text-xs text-verde-texto">
                    {tipo === 'anamnese' ? 'Perguntado' : tipo === 'exames' ? 'Pedido' : 'Examinado'}
                  </span>
                ) : antes.has(i.id) ? (
                  <span className="shrink-0 text-xs text-texto-2">{tipo === 'exames' ? 'Repetir' : 'Feito antes'}</span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ListaConduta({ aoConfirmar }: { aoConfirmar: (marcados: string[]) => void }) {
  const { caso, tentativa } = useTentativa()
  const t = tentativa!
  const opcoes = useMemo(() => opcoesDoMomento(caso, t.momentoAtual, t.id), [caso, t.momentoAtual, t.id])
  const [marcados, setMarcados] = useState<string[]>([])

  const alternar = (item: string) =>
    setMarcados((m) => (m.includes(item) ? m.filter((x) => x !== item) : [...m, item]))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="m-0 border-b border-borda px-4 py-3 text-sm text-texto-2">
        Marque tudo o que você faria agora. A conduta faz o caso avançar e não pode ser desfeita.
      </p>
      <div role="group" aria-label="Condutas" className="min-h-0 flex-1 overflow-y-auto p-2">
        {opcoes.map((o) => {
          const marcado = marcados.includes(o.item)
          return (
            <label
              key={o.item}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 hover:bg-fundo ${marcado ? 'bg-verde-suave' : ''}`}
            >
              <input
                type="checkbox"
                checked={marcado}
                onChange={() => alternar(o.item)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--verde)]"
              />
              <span>{o.rotulo}</span>
            </label>
          )
        })}
      </div>
      <div className="border-t border-borda p-3">
        <button
          type="button"
          className="botao botao-principal w-full"
          disabled={marcados.length === 0}
          onClick={() => aoConfirmar(marcados)}
        >
          {marcados.length === 0
            ? 'Marque ao menos uma conduta'
            : `Confirmar conduta (${marcados.length} ${marcados.length === 1 ? 'item' : 'itens'})`}
        </button>
      </div>
    </div>
  )
}
