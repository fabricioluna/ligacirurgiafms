// Painel do professor: entrada por código, interruptor do modo sem IA, tentativas,
// condutas não previstas e casos. Carregado só quando alguém abre /painel.

import { useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import { Cabecalho, Rodape } from '../componentes/Moldura'
import { atualizarCasos } from '../dados/casos'
import { chamarPainel, ErroPainel, salvarToken, tokenSalvo, type Resumo } from './api'
import { PainelCasos } from './PainelCasos'
import { PainelNaoPrevistas } from './PainelNaoPrevistas'
import { PainelTentativas } from './PainelTentativas'

export default function Painel() {
  const [token, setToken] = useState(tokenSalvo)
  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho>
        <p className="m-0 font-titulo text-lg font-bold">Painel do professor</p>
      </Cabecalho>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {token ? <Conteudo sair={() => (salvarToken(null), setToken(null))} /> : <Entrar entrou={setToken} />}
      </main>
      <Rodape />
    </div>
  )
}

function Entrar({ entrou }: { entrou: (t: string) => void }) {
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const r = await chamarPainel<{ token: string }>('entrar', { codigo })
      salvarToken(r.token)
      entrou(r.token)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-sm">
      <h1 className="m-0 text-2xl">Entrar no painel</h1>
      <p className="mt-2 mb-6 text-texto-2">Use o código de acesso do painel.</p>
      <label htmlFor="codigo" className="block font-medium">
        Código de acesso
      </label>
      <input
        id="codigo"
        type="password"
        autoComplete="current-password"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        className="mt-2 block min-h-12 w-full rounded-sm border border-borda bg-superficie px-3 text-base text-texto outline-none focus:border-verde"
      />
      {erro && (
        <p className="m-0 mt-3 text-perigosa" role="alert">
          {erro}
        </p>
      )}
      <button type="submit" className="botao botao-principal mt-4 w-full" disabled={!codigo || enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

function Conteudo({ sair }: { sair: () => void }) {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      setResumo(await chamarPainel<Resumo>('resumo'))
      setErro('')
    } catch (e) {
      if (e instanceof ErroPainel && e.status === 401) sair()
      else setErro((e as Error).message)
    }
  }, [sair])

  useEffect(() => {
    carregar()
  }, [carregar])

  if (erro) {
    return (
      <div className="border border-perigosa p-5">
        <p className="m-0 font-semibold">Não foi possível carregar o painel.</p>
        <p className="m-0 mt-1 text-texto-2">{erro}</p>
        <button type="button" className="botao botao-secundario mt-4" onClick={carregar}>
          Tentar de novo
        </button>
      </div>
    )
  }
  if (!resumo) return <p className="text-texto-2">Carregando…</p>

  const pendentes = resumo.naoPrevistas.filter((n) => !n.revisada).length
  const aba = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center border-b-2 px-1 font-semibold ${isActive ? 'border-verde text-texto' : 'border-transparent text-texto-2 hover:text-texto'}`

  return (
    <div className="space-y-8">
      <Contingencia ativa={resumo.config.contingencia} mudou={carregar} />

      <nav aria-label="Seções do painel" className="flex flex-wrap gap-x-6 border-b border-borda">
        <NavLink to="/painel" end className={aba}>
          Tentativas ({resumo.tentativas.length})
        </NavLink>
        <NavLink to="/painel/nao-previstas" className={aba}>
          Condutas não previstas{pendentes ? ` (${pendentes} para revisar)` : ''}
        </NavLink>
        <NavLink to="/painel/casos" className={aba}>
          Casos ({resumo.casos.length})
        </NavLink>
        <button type="button" onClick={sair} className="ml-auto min-h-11 text-sm text-texto-2 underline underline-offset-4">
          Sair
        </button>
      </nav>

      <Routes>
        <Route index element={<PainelTentativas resumo={resumo} recarregar={carregar} />} />
        <Route path="nao-previstas" element={<PainelNaoPrevistas resumo={resumo} recarregar={carregar} />} />
        <Route path="casos" element={<PainelCasos resumo={resumo} recarregar={carregar} />} />
      </Routes>
    </div>
  )
}

function Contingencia({ ativa, mudou }: { ativa: boolean; mudou: () => void }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const alternar = async () => {
    setEnviando(true)
    setErro('')
    try {
      await chamarPainel('contingencia', { ativa: !ativa })
      await atualizarCasos()
      mudou()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }
  return (
    <section
      aria-labelledby="t-contingencia"
      className={`flex flex-col gap-4 border-2 p-5 sm:flex-row sm:items-center ${ativa ? 'border-subotima' : 'border-borda'}`}
    >
      <div className="min-w-0 sm:flex-1">
        <h2 id="t-contingencia" className="m-0 font-sans text-lg font-semibold">
          Modo sem IA para todos os alunos: {ativa ? 'ligado' : 'desligado'}
        </h2>
        <p className="m-0 mt-1 text-sm text-texto-2">
          {ativa
            ? 'Só o simulador estático está disponível. Quem estava no simulador com IA é levado à lista na próxima mensagem.'
            : 'Use na demonstração ao vivo se a internet ou a IA falharem. Vale em até 1 minuto para quem já está com o site aberto.'}
        </p>
        {erro && <p className="m-0 mt-2 text-perigosa">{erro}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ativa}
        aria-labelledby="t-contingencia"
        onClick={alternar}
        disabled={enviando}
        className={`botao shrink-0 ${ativa ? 'botao-principal' : 'botao-secundario'}`}
      >
        {enviando ? 'Salvando…' : ativa ? 'Desligar o modo sem IA' : 'Ligar o modo sem IA'}
      </button>
    </section>
  )
}
