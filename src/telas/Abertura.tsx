// Abertura do caso: o modo guiado é o único modo disponível para o aluno.

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { DivisoriaSutura } from '../componentes/ProgressoSutura'
import { temaParaAluno } from '../motor/caso'
import { useTentativa } from '../tentativa'
import { estadoGuiadoSalvo, iniciarGuiado } from '../guiado/TelaGuiada'
import { roteiroDoCaso } from '../guiado/roteiros'

export function Abertura() {
  const { caso } = useTentativa()
  const navegar = useNavigate()
  const salvo = estadoGuiadoSalvo(caso)
  const [nome, setNome] = useState(salvo?.nomeInformado ?? '')
  const { titulo, tema, tempoEstimado } = caso.caso.identificacao
  const base = `/caso/${caso.id}`
  const temRoteiro = Boolean(roteiroDoCaso(caso))
  const emAndamento = Boolean(salvo && !salvo.desfecho)

  const ir = (retomar: boolean) => {
    iniciarGuiado(caso, nome, retomar)
    navegar(`${base}/guiado`)
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
          {/* Os objetivos de aprendizagem entregariam o raciocínio esperado: aparecem só no resultado. */}
          <h2 className="m-0 text-xl">Como funciona</h2>
          <ol className="leitura mt-4 mb-0 space-y-2 pl-5">
            <li>Você acompanha o caso uma decisão por vez.</li>
            <li>Em cada decisão, escolhe uma entre até 6 alternativas e vê na hora se está no caminho certo.</li>
            <li>O paciente evolui conforme a sua escolha. No fim, você vê a nota e o caminho esperado.</li>
          </ol>

          <DivisoriaSutura className="my-8" />

          <div className="mt-10 border border-borda bg-superficie p-5">
            {!temRoteiro ? (
              <p className="m-0">Este caso ainda não tem o roteiro do modo guiado e não pode ser jogado por enquanto.</p>
            ) : (
              <>
                {salvo?.desfecho && <p className="mt-0 mb-4">Você já terminou este caso. Pode jogar de novo quando quiser.</p>}
                {emAndamento ? (
                  <>
                    <p className="m-0">Você tem este caso em andamento neste aparelho.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" className="botao botao-principal" onClick={() => ir(true)}>
                        Continuar de onde parei
                      </button>
                      <button type="button" className="botao botao-secundario" onClick={() => ir(false)}>
                        Começar de novo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor="nome" className="block font-medium">
                      Seu nome <span className="font-normal text-texto-2">(opcional, só aparece no resultado)</span>
                    </label>
                    <input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      maxLength={80}
                      autoComplete="name"
                      className="mt-2 block min-h-12 w-full rounded-sm border border-borda bg-fundo px-3 text-base text-texto outline-none focus:border-verde"
                    />
                    <button type="button" className="botao botao-principal mt-4 w-full sm:w-auto" onClick={() => ir(false)}>
                      Começar o caso
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Rodape />
    </div>
  )
}
