// Cabeçalho e rodapé. A textura fica só aqui, na moldura.

import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import logo from '../../assets/logoliga.jpg'
import { gravar, ler } from '../armazenamento'

type Tema = 'escuro' | 'claro'

function SeletorTema() {
  const [tema, setTema] = useState<Tema>(() => (ler<Tema>('simulador:tema') === 'claro' ? 'claro' : 'escuro'))
  useEffect(() => {
    if (tema === 'claro') document.documentElement.dataset.theme = 'claro'
    else delete document.documentElement.dataset.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'claro' ? '#f3f3ee' : '#0a0a0a')
    gravar('simulador:tema', tema)
  }, [tema])
  const proximo = tema === 'escuro' ? 'claro' : 'escuro'
  return (
    <button
      type="button"
      onClick={() => setTema(proximo)}
      className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-borda text-texto hover:border-texto-2"
      aria-label={`Mudar para o tema ${proximo}`}
      title={`Tema ${proximo}`}
    >
      {tema === 'escuro' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  )
}

export function Cabecalho({ children }: { children?: ReactNode }) {
  return (
    <header className="textura nao-imprimir sticky top-0 z-20 border-b border-borda bg-fundo/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-sm" aria-label="Início">
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
          <span className="hidden font-titulo text-lg font-bold leading-none sm:block">
            Simulador de
            <br />
            casos clínicos
          </span>
        </Link>
        <div className="min-w-0 flex-1">{children}</div>
        <SeletorTema />
      </div>
    </header>
  )
}

export function Rodape() {
  return (
    <footer className="border-t border-borda py-6 text-xs text-texto-2">
      <div className="mx-auto max-w-6xl space-y-1 px-4">
        <p className="m-0">
          Ferramenta educacional. Os casos são fictícios e não servem para decisão sobre paciente real.
        </p>
        <p className="m-0">
          Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão. Coordenador da liga: Dr. Rafael Lucena.
          Desenvolvimento: Fabrício Luna.
        </p>
        <p className="nao-imprimir m-0 pt-2">
          <Link to="/painel" className="underline underline-offset-4 hover:text-texto">
            Painel do professor
          </Link>
        </p>
      </div>
    </footer>
  )
}
