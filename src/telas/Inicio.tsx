import { Link } from 'react-router'
import logo from '../../assets/logoliga.jpg'
import { casos } from '../dados/casos'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { tentativaSalva } from '../tentativa'

export function Inicio() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <main className="flex-1">
        <section className="textura border-b border-borda">
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-16">
            <img
              src={logo}
              alt="Logo da Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão"
              width={640}
              height={641}
              className="h-auto w-40 rounded-full sm:w-64"
            />
            <div>
              <h1 className="m-0 text-3xl sm:text-[4rem]">Simulador de casos clínicos</h1>
              <p className="leitura mt-4 mb-0 text-texto-2">
                Você recebe um paciente, decide o que perguntar, examinar e pedir, e define a conduta. O paciente evolui
                conforme suas decisões, e no fim você vê a nota e o que o professor esperava em cada momento.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="titulo-casos">
          <h2 id="titulo-casos" className="m-0 mb-5 text-xl">
            Casos disponíveis
          </h2>
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {casos.map((c) => {
              const salva = tentativaSalva(c)
              const { titulo, tema, tempoEstimado } = c.caso.identificacao
              return (
                <li key={c.id} className="flex flex-col border border-borda bg-superficie p-5">
                  <h3 className="m-0 text-xl uppercase">{titulo}</h3>
                  <p className="mt-2 mb-0 text-sm text-texto-2">{tema}</p>
                  <dl className="mt-4 mb-0 text-sm">
                    <div>
                      <dt className="text-texto-2">Tempo estimado</dt>
                      <dd className="m-0">{tempoEstimado}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link to={`/caso/${c.id}`} className="botao botao-principal">
                      {salva && !salva.desfecho ? 'Continuar caso' : 'Abrir caso'}
                    </Link>
                    {salva && !salva.desfecho && <span className="text-sm text-texto-2">Você parou no meio deste caso.</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </main>
      <Rodape />
    </div>
  )
}
