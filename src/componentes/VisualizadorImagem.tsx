// Imagem de exame: miniatura que abre em tela cheia sobre fundo preto, com crédito e licença visíveis.
// Série de cortes (tomografia): 'arquivo' termina em '/', os arquivos são 01.jpg, 02.jpg... e
// 'quantidade' diz quantos são. Enquanto o arquivo não existir, mostra um aviso de imagem pendente.

import { useEffect, useRef, useState } from 'react'
import type { Imagem } from '../motor/tipos'

const pasta = (casoId: string) => `/imagens/casos/${casoId.toLowerCase()}/`

export function arquivosDaImagem(imagem: Imagem): string[] {
  if (!imagem.arquivo.endsWith('/')) return [imagem.arquivo]
  const n = imagem.quantidade ?? 0
  return Array.from({ length: n }, (_, i) => `${imagem.arquivo}${String(i + 1).padStart(2, '0')}.jpg`)
}

function Credito({ imagem }: { imagem: Imagem }) {
  return (
    <p className="m-0 text-xs text-[#9e9e95]">
      {imagem.fonte && <>Fonte: {imagem.fonte}. </>}
      {imagem.licenca && <>Licença: {imagem.licenca}.</>}
    </p>
  )
}

export function VisualizadorImagem({ casoId, imagem }: { casoId: string; imagem: Imagem }) {
  const arquivos = arquivosDaImagem(imagem)
  const [falhou, setFalhou] = useState(arquivos.length === 0)
  const [corte, setCorte] = useState(0)
  const dialogo = useRef<HTMLDialogElement>(null)
  const src = (i: number) => pasta(casoId) + arquivos[i]
  const serie = arquivos.length > 1

  useEffect(() => {
    setFalhou(arquivosDaImagem(imagem).length === 0)
    setCorte(0)
  }, [imagem])

  if (falhou) {
    return (
      <figure className="m-0 border border-dashed border-subotima/60 p-4">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" />
            <path d="M3 16l5-5 4 4 3-3 6 6M3 4l18 16" />
          </svg>
          Imagem pendente ({imagem.id})
        </p>
        <p className="m-0 mt-1 text-sm text-texto-2">{imagem.legenda}</p>
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
        className="relative block w-full cursor-zoom-in bg-black p-0 text-left"
        aria-label={`Ampliar imagem: ${imagem.legenda ?? 'exame'}`}
      >
        <img src={src(0)} alt={imagem.legenda ?? ''} onError={() => setFalhou(true)} className="block max-h-64 w-full object-contain" />
        {serie && (
          <span className="absolute right-2 bottom-2 bg-black/80 px-2 py-1 text-xs text-[#f2f2ec]">{arquivos.length} cortes</span>
        )}
      </button>
      <dialog
        ref={dialogo}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-[#f2f2ec] backdrop:bg-black"
        onClick={(e) => e.target === dialogo.current && dialogo.current.close()}
        onKeyDown={(e) => {
          if (!serie) return
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCorte((c) => Math.min(arquivos.length - 1, c + 1))
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setCorte((c) => Math.max(0, c - 1))
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 p-4">
            <p className="m-0 text-sm">{imagem.legenda}</p>
            <button type="button" onClick={() => dialogo.current?.close()} className="botao border border-[#2b2b29] text-[#f2f2ec]">
              Fechar
            </button>
          </div>
          <img src={src(corte)} alt={imagem.legenda ?? ''} className="min-h-0 flex-1 object-contain" />
          <div className="space-y-3 p-4">
            {serie && (
              <label className="flex items-center gap-3 text-sm">
                <span className="numeros shrink-0">
                  Corte {corte + 1} de {arquivos.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={arquivos.length - 1}
                  value={corte}
                  onChange={(e) => setCorte(Number(e.target.value))}
                  className="h-11 flex-1 accent-[#9db017]"
                  aria-label="Escolher o corte"
                />
              </label>
            )}
            <Credito imagem={imagem} />
          </div>
        </div>
      </dialog>
    </>
  )
}
