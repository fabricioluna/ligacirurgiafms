// Simulador com IA: o aluno conversa com o paciente com as próprias palavras.
// O paciente responde no jeito dele, mas só com o que está no caso (o servidor confere a fala).
// Exames e laudos são sempre o texto do caso. Condutas são ordens que acontecem na hora, com o
// efeito escrito no caso; o momento só é avaliado quando o aluno o conclui. Antes de concluir o
// momento indicado no caso, o aluno registra a hipótese diagnóstica. Se a IA falhar, as listas
// continuam a um toque.

import { useMemo, useRef, useState } from 'react'
import { FalhaIA, interpretarConduta, interpretarHipotese, perguntarPaciente } from '../ia'
import { opcoesDoMomento } from '../motor/avaliacao'
import { acoesDisponiveis, efeitosDe, momento } from '../motor/caso'
import { ordensDoMomento } from '../motor/tentativa'
import { melhorDiagnostico, precisaDiagnostico, rotuloHipotese } from '../motor/diagnostico'
import type { Acao, Descoberta as TDescoberta, Fala } from '../motor/tipos'
import { useTentativa } from '../tentativa'
import { Descoberta } from './Descoberta'
import { FalaConversa } from './FalaConversa'

const LIMITE = 400

type Modo = Acao | 'hipotese'

const ROTULO: Record<Modo, string> = {
  hipotese: 'Hipótese',
  anamnese: 'Perguntar',
  exameFisico: 'Examinar',
  exames: 'Pedir exame',
  conduta: 'Conduta',
}

const DICA: Record<Modo | 'livre', string> = {
  livre: 'Converse com o paciente, examine, peça exames ou escreva sua conduta',
  hipotese: 'Qual a sua hipótese diagnóstica?',
  anamnese: 'O que você quer perguntar ao paciente?',
  exameFisico: 'O que você quer examinar?',
  exames: 'Qual exame você pede?',
  conduta: 'Escreva sua conduta para este momento',
}

// Resposta a cumprimento quando a fala da IA foi descartada: não traz informação nenhuma.
const RECONHECER = 'Tá bom, doutor.'

type Retorno =
  | { tipo: 'conversa'; desde: number }
  | { tipo: 'interpretacao'; texto: string; itens: string[]; naoReconhecidos: string[] }
  | { tipo: 'naoPrevista'; texto: string }
  | { tipo: 'pedeHipotese' }
  | { tipo: 'feito'; itens: string[] }
  | { tipo: 'hipotese'; texto: string; item: string }
  | { tipo: 'hipoteseNaoReconhecida'; texto: string }
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
  const pedeHipotese = precisaDiagnostico(caso, t)
  // A hipótese fica por último: primeiro o aluno conversa, examina e pede exames.
  const modos: Modo[] = pedeHipotese ? [...acoes, 'hipotese'] : acoes
  const [modo, setModo] = useState<Modo | null>(acoes.length === 1 ? acoes[0] : null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [retorno, setRetorno] = useState<Retorno | null>(null)
  // O aluno tentou concluir o momento sem hipótese: conclui logo depois de registrá-la.
  const [concluirDepois, setConcluirDepois] = useState(false)
  const ordens = ordensDoMomento(t)
  const campo = useRef<HTMLTextAreaElement>(null)
  const nome = caso.caso.paciente?.nome

  const rotulos = useMemo(
    () => new Map(opcoesDoMomento(caso, t.momentoAtual, t.id).map((o) => [o.item, o.rotulo])),
    [caso, t.momentoAtual, t.id],
  )

  const modoValido: Modo | null = modo && modos.includes(modo) ? modo : acoes.length === 1 && !pedeHipotese ? acoes[0] : null

  // As últimas trocas vão junto para o paciente manter a conversa coerente.
  const historico = (t.conversa ?? []).filter((f) => f.momento === t.momentoAtual).slice(-6).map((f) => ({ aluno: f.aluno, paciente: f.paciente }))

  async function avaliarConduta(escrito: string) {
    const r = await interpretarConduta(t.id, { casoId: caso.id, momento: t.momentoAtual, texto: escrito })
    if (r.itens.length === 0) {
      ctx.naoPrevista(escrito)
      setRetorno({ tipo: 'naoPrevista', texto: escrito })
    } else {
      setRetorno({ tipo: 'interpretacao', texto: escrito, itens: r.itens, naoReconhecidos: r.naoReconhecidos })
    }
    return true
  }

  async function avaliarHipotese(escrito: string) {
    const r = await interpretarHipotese(t.id, { casoId: caso.id, momento: t.momentoAtual, texto: escrito })
    const item = melhorDiagnostico(caso, r.itens)
    setRetorno(item ? { tipo: 'hipotese', texto: escrito, item } : { tipo: 'hipoteseNaoReconhecida', texto: escrito })
  }

  async function enviar() {
    const escrito = texto.trim()
    if (!escrito || enviando) return
    setEnviando(true)
    setRetorno(null)
    const antes = Date.now()
    let limpar = true
    try {
      if (modoValido === 'hipotese') {
        await avaliarHipotese(escrito)
      } else if (modoValido === 'conduta') {
        limpar = await avaliarConduta(escrito)
      } else {
        const r = await perguntarPaciente(t.id, {
          casoId: caso.id,
          caminho: t.caminho,
          texto: escrito,
          historico,
          feitos: ordens,
          ...(modoValido ? { atalho: modoValido } : {}),
        })
        const anamnese = r.itens.filter((i) => i.tipo === 'anamnese')
        const laudos = r.itens.filter((i) => i.tipo !== 'anamnese')
        if (r.intencao === 'conduta') {
          if (acoes.includes('conduta')) limpar = await avaliarConduta(escrito)
        } else if (r.intencao === 'exame_fisico' || r.intencao === 'pedido_exame') {
          if (r.fala) ctx.registrarFala(escrito, r.fala, [])
          if (laudos.length) ctx.revelarPedido(escrito, laudos)
          else ctx.semCorrespondencia(r.intencao === 'exame_fisico' ? 'exameFisico' : 'exames', escrito, r.respostaPadrao ?? caso.caso.respostaPadrao.laboratorioNaoListado)
          setRetorno({ tipo: 'conversa', desde: antes })
        } else {
          // Pergunta, conversa ou fora do caso: o paciente responde. Sem fala aprovada, vale o texto do caso.
          const doCaso = anamnese.map((i) => caso.caso.anamnese.find((a) => a.id === i.id)?.resposta ?? '').join(' ')
          const fala = r.fala ?? (doCaso || r.respostaPadrao || (r.intencao === 'conversa' ? RECONHECER : caso.caso.respostaPadrao.perguntaNaoListada))
          ctx.registrarFala(escrito, fala, anamnese, r.foraDoRoteiro)
          setRetorno({ tipo: 'conversa', desde: antes })
        }
      }
      if (limpar) setTexto('')
    } catch (e) {
      setRetorno({
        tipo: 'falha',
        mensagem: e instanceof FalhaIA ? e.message : 'A IA não respondeu.',
        acao: modoValido === 'hipotese' || !modoValido ? 'conduta' : modoValido,
      })
    } finally {
      setEnviando(false)
    }
  }

  // O que apareceu no último envio: falas do paciente e laudos, em ordem.
  const recentes = useMemo(() => {
    if (retorno?.tipo !== 'conversa') return []
    type Item = { em: number; f?: Fala; d?: TDescoberta }
    const falas: Item[] = (t.conversa ?? []).filter((f) => f.em >= retorno.desde).map((f) => ({ em: f.em, f }))
    const laudos: Item[] = t.descobertas.filter((d) => d.em >= retorno.desde && !d.viaConversa).map((d) => ({ em: d.em, d }))
    return [...falas, ...laudos].sort((a, b) => a.em - b.em)
  }, [retorno, t.conversa, t.descobertas])

  // A ordem acontece na hora; o momento continua até o aluno concluí-lo.
  const confirmar = () => {
    if (retorno?.tipo !== 'interpretacao') return
    for (const trecho of retorno.naoReconhecidos) ctx.naoPrevista(trecho)
    ctx.ordenar(retorno.itens, retorno.texto)
    setRetorno({ tipo: 'feito', itens: retorno.itens })
  }

  const concluir = () => {
    if (pedeHipotese) {
      setModo('hipotese')
      setConcluirDepois(true)
      setRetorno({ tipo: 'pedeHipotese' })
      campo.current?.focus()
      return
    }
    ctx.concluirMomento()
    setRetorno(null)
  }

  const reescrever = (anterior: string) => {
    setTexto(anterior)
    setRetorno(null)
    campo.current?.focus()
  }

  return (
    <div className="nao-imprimir fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-fundo pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:pb-0">
      {retorno && (
        <div className="max-h-[45dvh] overflow-y-auto border-b border-borda bg-superficie px-4 py-4 lg:max-h-[calc(100dvh-24rem)] lg:rounded-sm lg:border" aria-live="polite">
          {retorno.tipo === 'conversa' && (
            <div className="space-y-4">
              {recentes.map((x) => (x.f ? <FalaConversa key={`f${x.em}`} f={x.f} nome={nome} /> : <Descoberta key={`${x.d!.id}-${x.d!.em}`} d={x.d!} casoId={caso.id} />))}
            </div>
          )}

          {retorno.tipo === 'pedeHipotese' && (
            <div>
              <p className="m-0 font-semibold">Antes de concluir o momento, qual a sua hipótese diagnóstica?</p>
              <p className="m-0 mt-1 text-sm text-texto-2">Escreva com as suas palavras. Ela vale parte da nota e não pode ser trocada depois.</p>
            </div>
          )}

          {retorno.tipo === 'hipotese' && (
            <div>
              <p className="m-0 font-semibold">Entendemos sua hipótese assim:</p>
              <p className="m-0 mt-2">{rotuloHipotese(retorno.item)}</p>
              <p className="m-0 mt-3 text-sm text-texto-2">A hipótese não pode ser trocada depois.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="botao botao-principal"
                  onClick={() => {
                    ctx.registrarDiagnostico(retorno.item, retorno.texto)
                    setModo('conduta')
                    setRetorno(null)
                    if (concluirDepois) {
                      setConcluirDepois(false)
                      ctx.concluirMomento()
                    }
                  }}
                >
                  Confirmar hipótese
                </button>
                <button type="button" className="botao botao-secundario" onClick={() => reescrever(retorno.texto)}>
                  Reescrever
                </button>
              </div>
            </div>
          )}

          {retorno.tipo === 'hipoteseNaoReconhecida' && (
            <div>
              <p className="m-0 font-semibold">Não reconhecemos essa hipótese entre as do caso.</p>
              <p className="m-0 mt-1 text-sm text-texto-2">Reescreva com outras palavras, sendo mais específico, ou escolha na lista.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="botao botao-secundario" onClick={() => reescrever(retorno.texto)}>
                  Reescrever
                </button>
                <button type="button" className="botao botao-secundario" onClick={() => abrirLista('conduta')}>
                  Escolher na lista
                </button>
              </div>
            </div>
          )}

          {retorno.tipo === 'feito' && (
            <div>
              <p className="m-0 font-semibold">Feito:</p>
              <ul className="m-0 mt-1 space-y-1 pl-5">
                {retorno.itens.map((i) => (
                  <li key={i}>{rotulos.get(i) ?? i}</li>
                ))}
              </ul>
              {efeitosDe(caso, t.momentoAtual, retorno.itens).map((e) => (
                <p key={e.item} className="m-0 mt-3 border-l-2 border-verde pl-3">
                  {e.texto}
                </p>
              ))}
              <p className="m-0 mt-3 text-sm text-texto-2">Continue o atendimento ou conclua o momento quando terminar.</p>
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
              <p className="m-0 mt-3 text-sm text-texto-2">A ordem é feita na hora e não pode ser desfeita.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="botao botao-principal" onClick={confirmar}>
                  Fazer agora
                </button>
                <button type="button" className="botao botao-secundario" onClick={() => reescrever(retorno.texto)}>
                  Reescrever
                </button>
              </div>
            </div>
          )}

          {retorno.tipo === 'naoPrevista' && (
            <div>
              <p className="m-0 flex items-center gap-2 font-semibold text-nao-prevista">
                <span aria-hidden="true">?</span> Fora do roteiro
              </p>
              <p className="m-0 mt-1">
                Essa conduta não está prevista no roteiro deste momento, então não tem efeito no paciente. Não conta
                ponto nem penaliza, e fica registrada para o professor revisar.
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
        {ordens.length > 0 && (
          <div className="mb-2 flex items-center gap-3 rounded-sm border border-verde bg-verde-suave px-3 py-2">
            <p className="m-0 min-w-0 flex-1 text-sm">
              <span className="font-semibold">{ordens.length === 1 ? '1 conduta feita' : `${ordens.length} condutas feitas`}</span> neste momento.
            </p>
            <button type="button" className="botao botao-principal min-h-11 shrink-0 px-3 text-sm" onClick={concluir}>
              Concluir o momento
            </button>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 pb-1.5">
          <p className="m-0 text-xs text-texto-2">{nome ? `Converse com ${nome} ou escolha um atalho` : 'Escreva com suas palavras ou escolha um atalho'}</p>
          <button
            type="button"
            onClick={() => abrirLista(modoValido === 'hipotese' || !modoValido ? acoes[0] : modoValido)}
            className="min-h-9 shrink-0 text-sm text-texto-2 underline underline-offset-4 hover:text-texto"
          >
            Ver lista
          </button>
        </div>
        <div
          className={`grid gap-1.5 pb-2 ${modos.length === 1 ? 'grid-cols-1' : modos.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}
          role="group"
          aria-label="Atalhos"
        >
          {modos.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={modoValido === a}
              onClick={() => setModo(modoValido === a && modos.length > 1 ? null : a)}
              className={`min-h-11 rounded-sm border px-1 text-xs font-semibold sm:text-sm ${
                modoValido === a
                  ? a === 'conduta' || a === 'hipotese'
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
            {DICA[modoValido ?? 'livre']}
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
            placeholder={DICA[modoValido ?? 'livre']}
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
