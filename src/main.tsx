import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useParams } from 'react-router'
import './estilos/index.css'
import { atualizarCasos, buscarCaso, useCasos } from './dados/casos'
import { ProvedorTentativa } from './tentativa'
import { Inicio } from './telas/Inicio'
import { Abertura } from './telas/Abertura'
import { TelaGuiada } from './guiado/TelaGuiada'

// O painel do professor só carrega quando alguém abre /painel.
const Painel = lazy(() => import('./painel/Painel'))

function RotaCaso() {
  const { casoId = '' } = useParams()
  useCasos() // redesenha quando chegam os casos publicados pelo painel
  const caso = buscarCaso(casoId)
  if (!caso) return <NaoEncontrado />
  return (
    <ProvedorTentativa key={caso.id} caso={caso}>
      <Outlet />
    </ProvedorTentativa>
  )
}

function RedirecionaAbertura() {
  const { casoId = '' } = useParams()
  return <Navigate to={`/caso/${casoId}`} replace />
}

function NaoEncontrado() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <h1 className="m-0 text-2xl">Página não encontrada</h1>
      <p>O endereço não corresponde a nenhum caso disponível.</p>
      <Link to="/" className="botao botao-principal">Ver os casos disponíveis</Link>
    </main>
  )
}

atualizarCasos()

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/caso/:casoId" element={<RotaCaso />}>
          <Route index element={<Abertura />} />
          <Route path="guiado" element={<TelaGuiada />} />
          {/* Modos antigos (IA e estático) desligados: links velhos voltam para a abertura do caso. */}
          <Route path="*" element={<RedirecionaAbertura />} />
        </Route>
        <Route
          path="/painel/*"
          element={
            <Suspense fallback={<p className="p-6 text-texto-2">Carregando o painel…</p>}>
              <Painel />
            </Suspense>
          }
        />
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
