// Imagem de exame: miniatura que abre em tela cheia sobre fundo preto, com crédito e licença visíveis.
// Enquanto o arquivo não existir (imagem ainda pendente no caso), mostra um espaço reservado.

import { useEffect, useRef, useState } from 'react'
import type { Imagem } from '../motor/tipos'

const caminho = (casoId: string, arquivo: string) =>
  `/imagens/casos/${casoId.toLowerCase()}/${arquivo}`

function Credito({ imagem }: { imagem: Imagem }) {
  return (
    <p className="m-0 text-xs text-[#9e9e95]">
      {imagem.fonte && <>Fonte: {imagem.fonte}. </>}
      {imagem.licenca && <>Licença: {imagem.licenca}.</>}
    </p>
  )
}

export function VisualizadorImagem({ casoId, imagem }: { casoId: string; imagem: Imagem }) {
  const [falhou, setFalhou] = useState(imagem.arquivo.endsWith('/'))
  const dialogo = useRef<HTMLDialogElement>(null)
  const src = caminho(casoId, imagem.arquivo)

  useEffect(() => {
    setFalhou(imagem.arquivo.endsWith('/'))
  }, [imagem.arquivo])

  if (falhou) {
    return (
      <figure className="m-0 border border-dashed border-borda p-4">
        <p className="m-0 text-sm font-medium">Imagem pendente</p>
        <p className="m-0 text-sm text-texto-2">{imagem.legenda}</p>
        <div className="mt-2">
          <Credito imagem={imagem} />
        </div>
      </figure>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="block w-full cursor-zoom-in bg-black p-0 text-left"
        aria-label={`Ampliar imagem: ${imagem.legenda ?? 'exame'}`}
      >
        <img src={src} alt={imagem.legenda ?? ''} onError={() => setFalhou(true)} className="block max-h-64 w-full object-contain" />
      </button>
      <dialog
        ref={dialogo}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-[#f2f2ec] backdrop:bg-black"
        onClick={(e) => e.target === dialogo.current && dialogo.current.close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 p-4">
            <p className="m-0 text-sm">{imagem.legenda}</p>
            <button type="button" onClick={() => dialogo.current?.close()} className="botao border border-[#2b2b29] text-[#f2f2ec]">
              Fechar
            </button>
          </div>
          <img src={src} alt={imagem.legenda ?? ''} className="min-h-0 flex-1 object-contain" />
          <div className="p-4">
            <Credito imagem={imagem} />
          </div>
        </div>
      </dialog>
    </>
  )
}
