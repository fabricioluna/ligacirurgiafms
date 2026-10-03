import { useState } from 'react'
import { contingenciaAtiva } from '../contingencia'
import { ehPrevia, useCasos } from '../dados/casos'
import type { ModoSimulador } from '../motor/tipos'
import { useNavigate } from 'react-router'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { DivisoriaSutura } from '../componentes/ProgressoSutura'
import { temaParaAluno } from '../motor/caso'
import { useTentativa } from '../tentativa'

export function Abertura() {
  const { caso, tentativa, iniciar, descartar } = useTentativa()
  const navegar = useNavigate()
  const [nome, setNome] = useState(tentativa?.nomeInformado ?? '')
  const { config } = useCasos()
  const [contingenciaLocal] = useState(contingenciaAtiva)
  // Prévia do painel: o caso ainda não está publicado, então a IA não o conhece.
  const contingencia = contingenciaLocal || config.contingencia || ehPrevia(caso.id)
  const [modo, setModo] = useState<ModoSimulador>(contingencia ? 'estatico' : tentativa?.modo ?? 'ia')
  const { titulo, tema, tempoEstimado } = caso.caso.identificacao
  const base = `/caso/${caso.id}`

  const comecar = () => {
    iniciar(nome, contingencia ? 'estatico' : modo)
    navegar(`${base}/atendimento`)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <main className="flex-1">
        <section className="textura border-b border-borda">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
            <p className="m-0 text-sm text-texto-2">{temaParaAluno(tema)}</p>
            <h1 className="mt-3 mb-0 text-2xl uppercase sm:text-3xl">{titulo}</h1>
            <p className="mt-4 mb-0 text-sm text-texto-2">{tempoEstimado}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Os objetivos de aprendizagem entregariam o raciocínio esperado: aparecem só no relatório. */}
          <h2 className="m-0 text-xl">Como funciona</h2>
          <ol className="leitura mt-4 mb-0 space-y-2 pl-5">
            <li>Em cada momento do caso, pergunte ao paciente, examine e peça exames. Tudo isso conta na avaliação.</li>
            <li>Quando estiver pronto, defina a conduta. É ela que faz o caso avançar, e o paciente evolui conforme sua decisão.</li>
            <li>Depois de cada conduta você vê a avaliação do momento. No fim, a nota e o caminho que o professor esperava.</li>
          </ol>

          <DivisoriaSutura className="my-8" />

          <div className="mt-10 border border-borda bg-superficie p-5">
            {tentativa && !tentativa.desfecho ? (
              <>
                <p className="m-0">Você tem este caso em andamento neste aparelho.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="botao botao-principal" onClick={() => navegar(`${base}/atendimento`)}>
                    Continuar de onde parei
                  </button>
                  <button type="button" className="botao botao-secundario" onClick={descartar}>
                    Começar de novo
                  </button>
                </div>
              </>
            ) : (
              <>
                {tentativa?.desfecho && (
                  <p className="mt-0 mb-4">
                    Você já terminou este caso.{' '}
                    <button type="button" className="text-verde-texto underline underline-offset-4" onClick={() => navegar(`${base}/relatorio`)}>
                      Ver o relatório
                    </button>
                  </p>
                )}
                <fieldset className="m-0 mb-6 border-0 p-0">
                  <legend className="mb-3 p-0 font-medium">Como você quer conduzir o caso</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OpcaoModo
                      valor="ia"
                      atual={modo}
                      onChange={setModo}
                      titulo="Simulador com IA"
                      texto="Você escreve com suas palavras, como num atendimento de verdade. Precisa de internet."
                      desativado={contingencia}
                    />
                    <OpcaoModo
                      valor="estatico"
                      atual={contingencia ? 'estatico' : modo}
                      onChange={setModo}
                      titulo="Simulador estático"
                      texto="Você escolhe perguntas, exames e condutas em listas. Funciona mesmo sem internet."
                    />
                  </div>
                  {contingencia && (
                    <p className="m-0 mt-3 text-sm text-texto-2">
                      {ehPrevia(caso.id)
                        ? 'Prévia do painel: o caso ainda não foi publicado, então só o simulador estático funciona.'
                        : 'Modo sem IA ativo: só o simulador estático está disponível.'}
                    </p>
                  )}
                </fieldset>
                <label htmlFor="nome" className="block font-medium">
                  Seu nome <span className="font-normal text-texto-2">(opcional, só aparece no relatório)</span>
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  className="mt-2 block min-h-12 w-full rounded-sm border border-borda bg-fundo px-3 text-base text-texto outline-none focus:border-verde"
                />
                <button type="button" className="botao botao-principal mt-4 w-full sm:w-auto" onClick={comecar}>
                  Começar o atendimento
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <Rodape />
    </div>
  )
}

function OpcaoModo(props: {
  valor: ModoSimulador
  atual: ModoSimulador
  onChange: (m: ModoSimulador) => void
  titulo: string
  texto: string
  desativado?: boolean
}) {
  const marcado = props.atual === props.valor && !props.desativado
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-sm border-2 p-4 ${
        props.desativado ? 'cursor-not-allowed border-borda opacity-50' : marcado ? 'border-verde bg-verde-suave' : 'border-borda hover:border-texto-2'
      }`}
    >
      <input
        type="radio"
        name="modo"
        value={props.valor}
        checked={marcado}
        disabled={props.desativado}
        onChange={() => props.onChange(props.valor)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--verde)]"
      />
      <span>
        <span className="block font-semibold">{props.titulo}</span>
        <span className="mt-1 block text-sm text-texto-2">{props.texto}</span>
      </span>
    </label>
  )
}
