// Simulador com IA: o aluno escreve com as próprias palavras.
// O que aparece é sempre o texto do caso; a IA só aponta a qual item o pedido corresponde.
// Se a IA falhar, as listas do simulador estático continuam a um toque.

import { useMemo, useRef, useState } from 'react'
import { FalhaIA, interpretarConduta, perguntarPaciente } from '../ia'
import { opcoesDoMomento } from '../motor/avaliacao'
import { acoesDisponiveis, momento } from '../motor/caso'
import type { Acao, Descoberta as TDescoberta, TipoDescoberta } from '../motor/tipos'
import { useTentativa } from '../tentativa'
import { Descoberta } from './Descoberta'

const LIMITE = 400

const ROTULO: Record<Acao, string> = {
  anamnese: 'Perguntar',
  exameFisico: 'Examinar',
  exames: 'Pedir exame',
  conduta: 'Conduta',
}

const DICA: Record<Acao | 'livre', string> = {
  livre: 'Pergunte, examine, peça exames ou escreva sua conduta',
  anamnese: 'O que você quer perguntar ao paciente?',
  exameFisico: 'O que você quer examinar?',
  exames: 'Qual exame você pede?',
  conduta: 'Escreva sua conduta para este momento',
}

const TIPO_DA_INTENCAO: Record<string, TipoDescoberta> = { pergunta: 'anamnese', exame_fisico: 'exameFisico', pedido_exame: 'exames' }

type Retorno =
  | { tipo: 'descobertas'; chaves: string[] }
  | { tipo: 'interpretacao'; texto: string; itens: string[]; naoReconhecidos: string[] }
  | { tipo: 'naoPrevista'; texto: string }
  | { tipo: 'falha'; mensagem: string; acao: Acao }

interface Props {
  abrirLista: (a: Acao) => void
}

export function CampoTexto({ abrirLista }: Props) {
  const ctx = useTentativa()
  const { caso, tentativa } = ctx
  const t = tentativa!
  const m = momento(caso, t.momentoAtual)
  const acoes = acoesDisponiveis(m)
  const [atalho, setAtalho] = useState<Acao | null>(acoes.length === 1 ? acoes[0] : null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [retorno, setRetorno] = useState<Retorno | null>(null)
  const campo = useRef<HTMLTextAreaElement>(null)

  const rotulos = useMemo(
    () => new Map(opcoesDoMomento(caso, t.momentoAtual, t.id).map((o) => [o.item, o.rotulo])),
    [caso, t.momentoAtual, t.id],
  )

  const atalhoValido = atalho && acoes.includes(atalho) ? atalho : acoes.length === 1 ? acoes[0] : null

  async function avaliarConduta(escrito: string) {
    const r = await interpretarConduta(t.id, { casoId: caso.id, momento: t.momentoAtual, texto: escrito })
    if (r.itens.length === 0) {
      ctx.naoPrevista(escrito)
      setRetorno({ tipo: 'naoPrevista', texto: escrito })
    } else {
      setRetorno({ tipo: 'interpretacao', texto: escrito, itens: r.itens, naoReconhecidos: r.naoReconhecidos })
    }
  }

  async function enviar() {
    const escrito = texto.trim()
    if (!escrito || enviando) return
    setEnviando(true)
    setRetorno(null)
    try {
      if (atalhoValido === 'conduta') {
        await avaliarConduta(escrito)
      } else {
        const r = await perguntarPaciente(t.id, {
          casoId: caso.id,
          caminho: t.caminho,
          texto: escrito,
          ...(atalhoValido ? { atalho: atalhoValido } : {}),
        })
        if (r.intencao === 'conduta') {
          if (acoes.includes('conduta')) await avaliarConduta(escrito)
        } else if (r.itens.length) {
          ctx.revelarPedido(escrito, r.itens)
          setRetorno({ tipo: 'descobertas', chaves: r.itens.map((i) => i.id) })
        } else {
          ctx.semCorrespondencia(TIPO_DA_INTENCAO[r.intencao] ?? 'anamnese', escrito, r.respostaPadrao ?? caso.caso.respostaPadrao.perguntaNaoListada)
          setRetorno({ tipo: 'descobertas', chaves: [] })
        }
      }
      setTexto('')
    } catch (e) {
      setRetorno({
        tipo: 'falha',
        mensagem: e instanceof FalhaIA ? e.message : 'A IA não respondeu.',
        acao: atalhoValido ?? 'conduta',
      })
    } finally {
      setEnviando(false)
    }
  }

  // Descobertas do último envio: os itens revelados agora, ou a resposta padrão registrada.
  const recentes: TDescoberta[] = useMemo(() => {
    if (retorno?.tipo !== 'descobertas') return []
    const doMomento = t.descobertas.filter((d) => d.momento === t.momentoAtual)
    if (retorno.chaves.length === 0) return doMomento.slice(-1)
    return doMomento.filter((d) => retorno.chaves.includes(d.id))
  }, [retorno, t.descobertas, t.momentoAtual])

  const confirmar = () => {
    if (retorno?.tipo !== 'interpretacao') return
    for (const trecho of retorno.naoReconhecidos) ctx.naoPrevista(trecho)
    ctx.definirConduta(retorno.itens, retorno.texto)
    setRetorno(null)
  }

  return (
    <div className="nao-imprimir fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-fundo pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:pb-0">
      {retorno && (
        <div className="max-h-[45dvh] overflow-y-auto border-b border-borda bg-superficie px-4 py-4 lg:max-h-[calc(100dvh-24rem)] lg:rounded-sm lg:border" aria-live="polite">
          {retorno.tipo === 'descobertas' && (
            <div className="space-y-4">
              {recentes.map((d) => (
                <Descoberta key={`${d.id}-${d.em}`} d={d} casoId={caso.id} />
              ))}
            </div>
          )}

          {retorno.tipo === 'interpretacao' && (
            <div>
              <p className="m-0 font-semibold">Entendemos sua conduta assim:</p>
              <ul className="m-0 mt-2 space-y-1 pl-5">
                {retorno.itens.map((i) => (
                  <li key={i}>{rotulos.get(i) ?? i}</li>
                ))}
              </ul>
              {retorno.naoReconhecidos.length > 0 && (
                <>
                  <p className="m-0 mt-3 text-sm text-texto-2">Não previsto para este momento, fica registrado para o professor:</p>
                  <ul className="m-0 mt-1 space-y-1 pl-5 text-sm text-texto-2">
                    {retorno.naoReconhecidos.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="m-0 mt-3 text-sm text-texto-2">A conduta faz o caso avançar e não pode ser desfeita.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="botao botao-principal" onClick={confirmar}>
                  Confirmar conduta
                </button>
                <button
                  type="button"
                  className="botao botao-secundario"
                  onClick={() => {
                    setTexto(retorno.texto)
                    setRetorno(null)
                    campo.current?.focus()
                  }}
                >
                  Reescrever
                </button>
              </div>
            </div>
          )}

          {retorno.tipo === 'naoPrevista' && (
            <div>
              <p className="m-0 flex items-center gap-2 font-semibold text-nao-prevista">
                <span aria-hidden="true">?</span> Conduta não prevista
              </p>
              <p className="m-0 mt-1">
                O que você escreveu não corresponde a nenhuma conduta prevista para este momento. Não conta ponto nem
                penaliza, e fica registrado para o professor revisar.
              </p>
              <p className="m-0 mt-2 text-sm text-texto-2">Reescreva com outras palavras ou escolha na lista.</p>
              <button type="button" className="botao botao-secundario mt-3" onClick={() => abrirLista('conduta')}>
                Escolher conduta na lista
              </button>
            </div>
          )}

          {retorno.tipo === 'falha' && (
            <div>
              <p className="m-0 font-semibold text-subotima">{retorno.mensagem}</p>
              <p className="m-0 mt-1 text-sm text-texto-2">O caso continua pela lista, sem depender da IA.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="botao botao-secundario" onClick={() => abrirLista(retorno.acao)}>
                  Usar a lista
                </button>
                <button type="button" className="botao botao-secundario" onClick={ctx.seguirSemIA}>
                  Seguir sem IA neste caso
                </button>
              </div>
            </div>
          )}

          <button type="button" className="mt-3 text-sm text-texto-2 underline underline-offset-4" onClick={() => setRetorno(null)}>
            Ocultar
          </button>
        </div>
      )}

      <div className="mx-auto max-w-xl px-2 pt-2 lg:max-w-none lg:px-0">
        <div className="flex items-center justify-between gap-3 pb-1.5">
          <p className="m-0 text-xs text-texto-2">Escreva com suas palavras ou escolha um atalho</p>
          <button
            type="button"
            onClick={() => abrirLista(atalhoValido ?? acoes[0])}
            className="min-h-9 shrink-0 text-sm text-texto-2 underline underline-offset-4 hover:text-texto"
          >
            Ver lista
          </button>
        </div>
        <div className={`grid gap-1.5 pb-2 ${acoes.length === 1 ? 'grid-cols-1' : 'grid-cols-4'}`} role="group" aria-label="Atalhos">
          {acoes.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={atalhoValido === a}
              onClick={() => setAtalho(atalhoValido === a && acoes.length > 1 ? null : a)}
              className={`min-h-11 rounded-sm border px-1 text-xs font-semibold sm:text-sm ${
                atalhoValido === a
                  ? a === 'conduta'
                    ? 'border-verde bg-verde text-sobre-verde'
                    : 'border-verde bg-verde-suave text-texto'
                  : 'border-borda text-texto hover:border-texto-2'
              }`}
            >
              {ROTULO[a]}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
        >
          <label htmlFor="campo-aluno" className="sr-only">
            {DICA[atalhoValido ?? 'livre']}
          </label>
          <textarea
            id="campo-aluno"
            ref={campo}
            value={texto}
            maxLength={LIMITE}
            rows={2}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar()
              }
            }}
            placeholder={DICA[atalhoValido ?? 'livre']}
            disabled={enviando}
            className="min-h-12 flex-1 resize-none rounded-sm border-2 border-borda bg-superficie px-3 py-2 text-base text-texto outline-none placeholder:text-texto-2 focus:border-verde disabled:opacity-60"
          />
          <button type="submit" className="botao botao-principal shrink-0 px-4" disabled={enviando || !texto.trim()}>
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
        {texto.length > LIMITE - 60 && (
          <p className="m-0 mt-1 text-right text-xs text-texto-2">
            {texto.length} de {LIMITE} caracteres
          </p>
        )}
      </div>
    </div>
  )
}
