// Simulador com IA: comentário do preceptor no relatório final, escrito pela IA a partir da folha resposta.
// O relatório fixo continua logo abaixo, como referência. Se a IA falhar, só este bloco some.

import { useEffect, useRef, useState } from 'react'
import { FalhaIA, escreverComentario } from '../ia'
import { useTentativa } from '../tentativa'

function Lista({ titulo, itens, destaque }: { titulo: string; itens: string[]; destaque?: boolean }) {
  if (!itens.length) return null
  return (
    <div>
      <h3 className={`m-0 font-sans text-base font-semibold ${destaque ? 'text-perigosa' : ''}`}>{titulo}</h3>
      <ul className="m-0 mt-2 space-y-2 pl-5">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

export function ComentarioPreceptor() {
  const { caso, tentativa, salvarComentario } = useTentativa()
  const t = tentativa!
  const [estado, setEstado] = useState<'carregando' | 'falha' | 'pronto'>(t.comentario ? 'pronto' : 'carregando')
  const [erro, setErro] = useState('')
  const pedido = useRef(false)

  const pedir = () => {
    pedido.current = true
    setEstado('carregando')
    escreverComentario(t.id, {
      casoId: caso.id,
      desfecho: t.desfecho!,
      qtdNaoPrevistas: t.naoPrevistas.length,
      passos: t.passos,
      diagnostico: t.diagnostico?.item,
    })
      .then((c) => {
        salvarComentario(c)
        setEstado('pronto')
      })
      .catch((e) => {
        setErro(e instanceof FalhaIA ? e.message : 'A IA não respondeu.')
        setEstado('falha')
      })
  }

  useEffect(() => {
    if (!t.comentario && !pedido.current) pedir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const c = t.comentario

  return (
    <section aria-labelledby="t-preceptor" aria-busy={estado === 'carregando'} className="border border-borda bg-superficie p-5">
      <h2 id="t-preceptor" className="m-0 text-xl">
        Comentário do preceptor
      </h2>
      <p className="mt-1 mb-0 text-sm text-texto-2">Escrito pela IA a partir da folha resposta deste caso.</p>

      {estado === 'carregando' && (
        <p className="mt-4 mb-0 text-texto-2" aria-live="polite">
          Escrevendo o comentário…
        </p>
      )}

      {estado === 'falha' && (
        <div className="mt-4" aria-live="polite">
          <p className="m-0">{erro} O relatório abaixo vem direto da folha resposta e está completo.</p>
          <button type="button" className="botao botao-secundario nao-imprimir mt-3" onClick={pedir}>
            Tentar de novo
          </button>
        </div>
      )}

      {estado === 'pronto' && c && (
        <div className="leitura mt-4 space-y-5">
          <p className="m-0">{c.resumo}</p>
          {c.raciocinio && (
            <div>
              <h3 className="m-0 font-sans text-base font-semibold">Como pensar este caso</h3>
              <p className="m-0 mt-2">{c.raciocinio}</p>
            </div>
          )}
          <Lista titulo="O que foi bem conduzido" itens={c.pontosFortes} />
          <Lista titulo="O que custou tempo, risco ou recurso" itens={c.pontosACorrigir} />
          <Lista titulo="Erros críticos" itens={c.errosCriticos} destaque />
          <div>
            <h3 className="m-0 font-sans text-base font-semibold">O que estudar</h3>
            <p className="m-0 mt-2">{c.oQueEstudar}</p>
          </div>
        </div>
      )}
    </section>
  )
}
