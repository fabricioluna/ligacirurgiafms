import { Link, Navigate } from 'react-router'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { desfecho } from '../motor/caso'
import { useTentativa } from '../tentativa'

export const QUALIDADE: Record<string, { rotulo: string; cor: string }> = {
  otimo: { rotulo: 'Desfecho ótimo', cor: 'var(--c-ideal)' },
  bom: { rotulo: 'Desfecho bom', cor: 'var(--c-aceitavel)' },
  ruim: { rotulo: 'Desfecho ruim', cor: 'var(--c-subotima)' },
  grave: { rotulo: 'Desfecho grave', cor: 'var(--c-perigosa)' },
}

export function Desfecho() {
  const { caso, tentativa } = useTentativa()
  if (!tentativa?.desfecho) return <Navigate to={`/caso/${caso.id}`} replace />
  const d = desfecho(caso, tentativa.desfecho)
  const q = d.qualidade ? QUALIDADE[d.qualidade] : null

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <main className="textura flex flex-1 items-center">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          {q && (
            <p className="m-0 flex items-center gap-3 font-semibold" style={{ color: q.cor }}>
              <span className="inline-block h-0.5 w-10" style={{ background: q.cor }} aria-hidden="true" />
              {q.rotulo}
            </p>
          )}
          <h1 className="mt-3 mb-0 text-lg text-texto-2">O que aconteceu com o paciente</h1>
          <p className="leitura mt-4 mb-0 font-titulo text-2xl leading-tight font-semibold sm:text-3xl">{d.texto}</p>
          <Link to={`/caso/${caso.id}/relatorio`} className="botao botao-principal mt-10">
            Ver o relatório
          </Link>
        </div>
      </main>
      <Rodape />
    </div>
  )
}
