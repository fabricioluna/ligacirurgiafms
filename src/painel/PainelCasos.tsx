// Casos: os do projeto (só leitura) e os cadastrados pelo painel.
// Cadastro: dois PDFs → a IA monta o caso → validação → prévia jogável → publicar.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { registrarPrevia } from '../dados/casos'
import type { Caso } from '../motor/tipos'
import type { Validacao } from '../motor/validacao'
import { chamarPainel, type CasoResumo, type ImagemDoCaso, type Resumo } from './api'
import { textoDoPdf } from './pdf'

export function PainelCasos({ resumo, recarregar }: { resumo: Resumo; recarregar: () => void }) {
  const [novo, setNovo] = useState(false)
  return (
    <section aria-label="Casos" className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="leitura m-0 flex-1 text-texto-2">
          Os casos do projeto vêm junto com o site e funcionam até sem internet. Os cadastrados aqui ficam no banco e
          aparecem para os alunos assim que publicados.
        </p>
        {!novo && (
          <button type="button" className="botao botao-principal" onClick={() => setNovo(true)}>
            Cadastrar caso a partir dos PDFs
          </button>
        )}
      </div>
      {novo && <NovoCaso fechar={() => setNovo(false)} salvo={recarregar} />}
      <ul className="m-0 list-none space-y-4 p-0">
        {resumo.casos.map((c) => (
          <CartaoCaso key={c.id} c={c} recarregar={recarregar} />
        ))}
      </ul>
    </section>
  )
}

function ListaValidacao({ v, pendencias = [] }: { v: Validacao; pendencias?: string[] }) {
  if (!v.erros.length && !v.avisos.length && !pendencias.length) return <p className="m-0 text-sm text-ideal">Nenhum problema encontrado.</p>
  return (
    <div className="space-y-3 text-sm">
      {v.erros.length > 0 && (
        <details open>
          <summary className="cursor-pointer font-semibold text-perigosa">{v.erros.length} erro(s): impedem a publicação</summary>
          <ul className="m-0 mt-2 space-y-1 pl-5">{v.erros.map((e) => <li key={e}>{e}</li>)}</ul>
        </details>
      )}
      {pendencias.length > 0 && (
        <details open>
          <summary className="cursor-pointer font-semibold text-subotima">{pendencias.length} informação(ões) que não estavam nos PDFs</summary>
          <ul className="m-0 mt-2 space-y-1 pl-5">{pendencias.map((e) => <li key={e}>{e}</li>)}</ul>
        </details>
      )}
      {v.avisos.length > 0 && (
        <details>
          <summary className="cursor-pointer font-semibold text-texto-2">{v.avisos.length} aviso(s)</summary>
          <ul className="m-0 mt-2 space-y-1 pl-5">{v.avisos.map((e) => <li key={e}>{e}</li>)}</ul>
        </details>
      )}
    </div>
  )
}

// Confere no próprio site quais arquivos de imagem já existem.
function Imagens({ imagens }: { imagens: ImagemDoCaso[] }) {
  const [existe, setExiste] = useState<Record<string, boolean>>({})
  useEffect(() => {
    let vivo = true
    Promise.all(
      imagens.flatMap((i) => i.arquivos).map(async (a) => {
        const r = await fetch(a, { method: 'HEAD' }).catch(() => null)
        return [a, !!r?.ok && !(r.headers.get('content-type') ?? '').includes('text/html')] as const
      }),
    ).then((pares) => vivo && setExiste(Object.fromEntries(pares)))
    return () => {
      vivo = false
    }
  }, [imagens])
  if (!imagens.length) return <p className="m-0 text-sm text-texto-2">O caso não usa imagens.</p>
  return (
    <ul className="m-0 space-y-1 pl-5 text-sm">
      {imagens.map((i) => {
        const ok = i.arquivos.length > 0 && i.arquivos.every((a) => existe[a])
        return (
          <li key={i.id + i.exame}>
            <span className={ok ? 'text-ideal' : 'text-subotima'}>{ok ? 'No lugar' : 'Falta'}</span>: {i.id}, {i.exame}
            {i.legenda && <span className="text-texto-2">. {i.legenda}</span>}
            {!ok && <span className="block text-xs text-texto-2">{i.arquivos.length ? i.arquivos.join(', ') : 'série sem quantidade definida'}</span>}
          </li>
        )
      })}
    </ul>
  )
}

function CartaoCaso({ c, recarregar }: { c: CasoResumo; recarregar: () => void }) {
  const navegar = useNavigate()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (publicar: boolean) => {
    if (!c.caso) return
    setOcupado(true)
    setErro('')
    try {
      const r = await chamarPainel<{ ok: boolean }>('salvarCaso', { caso: c.caso, publicar })
      if (!r.ok) setErro('O caso tem erros e não pode ser publicado.')
      recarregar()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  const excluir = async () => {
    if (!window.confirm(`Excluir o caso ${c.id}? Isso não pode ser desfeito.`)) return
    setOcupado(true)
    try {
      await chamarPainel('excluirCaso', { id: c.id })
      recarregar()
    } finally {
      setOcupado(false)
    }
  }

  return (
    <li className="border border-borda bg-superficie p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm text-texto-2">
            {c.id}, {c.origem === 'projeto' ? 'do projeto' : 'cadastrado no painel'}, versão {c.versao || '–'}
          </p>
          <h3 className="m-0 mt-1 text-lg uppercase">{c.titulo}</h3>
          <p className={`m-0 mt-1 text-sm font-semibold ${c.publicado ? 'text-ideal' : 'text-subotima'}`}>
            {c.publicado ? 'Publicado: aparece para os alunos' : 'Rascunho: não aparece para os alunos'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.caso && (
            <button
              type="button"
              className="botao botao-secundario"
              onClick={() => {
                registrarPrevia({ ...c.caso!, publicado: true } as Caso)
                navegar(`/caso/${c.id}`)
              }}
            >
              Jogar prévia
            </button>
          )}
          {c.origem === 'painel' && (
            <>
              <button type="button" className="botao botao-secundario" disabled={ocupado} onClick={() => salvar(!c.publicado)}>
                {c.publicado ? 'Tirar do ar' : 'Publicar'}
              </button>
              <button type="button" className="botao botao-secundario" disabled={ocupado} onClick={excluir}>
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
      {erro && <p className="m-0 mt-3 text-perigosa">{erro}</p>}
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="m-0 mb-2 font-sans text-sm font-semibold">Validação</h4>
          <ListaValidacao v={c.validacao} />
        </div>
        <div>
          <h4 className="m-0 mb-2 font-sans text-sm font-semibold">Imagens</h4>
          <Imagens imagens={c.imagens} />
        </div>
      </div>
    </li>
  )
}

interface Extraido {
  caso: Caso
  pendencias: string[]
  validacao: Validacao
}

function NovoCaso({ fechar, salvo }: { fechar: () => void; salvo: () => void }) {
  const navegar = useNavigate()
  const [pdfCaso, setPdfCaso] = useState<File | null>(null)
  const [pdfFolha, setPdfFolha] = useState<File | null>(null)
  const [etapa, setEtapa] = useState<'escolher' | 'lendo' | 'montando' | 'pronto'>('escolher')
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<Extraido | null>(null)

  const montar = async () => {
    if (!pdfCaso || !pdfFolha) return
    setErro('')
    try {
      setEtapa('lendo')
      const [textoCaso, textoFolha] = await Promise.all([textoDoPdf(pdfCaso), textoDoPdf(pdfFolha)])
      setEtapa('montando')
      setResultado(await chamarPainel<Extraido>('extrairCaso', { textoCaso, textoFolha }, 290_000))
      setEtapa('pronto')
    } catch (e) {
      setErro((e as Error).message)
      setEtapa('escolher')
    }
  }

  // Arquivo do caso corrigido à mão (baixado daqui, editado e enviado de volta).
  const trocarJson = async (arquivo: File) => {
    try {
      const caso = JSON.parse(await arquivo.text()) as Caso
      const r = await chamarPainel<{ ok: boolean; validacao: Validacao }>('salvarCaso', { caso, publicar: false })
      setResultado({ caso, pendencias: [], validacao: r.validacao })
      salvo()
    } catch (e) {
      setErro(`Arquivo inválido: ${(e as Error).message}`)
    }
  }

  const salvar = async (publicar: boolean) => {
    if (!resultado) return
    try {
      const r = await chamarPainel<{ ok: boolean; validacao: Validacao }>('salvarCaso', { caso: resultado.caso, publicar })
      setResultado({ ...resultado, validacao: r.validacao })
      if (r.ok) {
        salvo()
        fechar()
      } else setErro('O caso tem erros e não pode ser publicado. Foi mantido como rascunho.')
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  const baixar = () => {
    if (!resultado) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(resultado.caso, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${resultado.caso.id.toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const arquivo = (rotulo: string, ajuda: string, f: File | null, set: (f: File | null) => void) => (
    <label className="block">
      <span className="block font-medium">{rotulo}</span>
      <span className="block text-sm text-texto-2">{ajuda}</span>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => set(e.target.files?.[0] ?? null)}
        className="mt-2 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-sm file:border file:border-borda file:bg-fundo file:px-4 file:text-texto"
      />
      {f && <span className="mt-1 block text-xs text-texto-2">{f.name}</span>}
    </label>
  )

  return (
    <div className="border-2 border-verde p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 text-xl">Cadastrar caso</h2>
        <button type="button" className="text-sm text-texto-2 underline underline-offset-4" onClick={fechar}>
          Cancelar
        </button>
      </div>

      {etapa !== 'pronto' && (
        <>
          <p className="leitura mt-2 mb-5 text-sm text-texto-2">
            A IA transforma os dois documentos no formato do simulador. Ela só copia o que está escrito: o que faltar
            aparece como pendência. Nada é publicado sem a sua conferência na prévia.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {arquivo('PDF do caso', 'Apresentação, anamnese, exame físico, exames, momentos, regras e desfechos.', pdfCaso, setPdfCaso)}
            {arquivo('PDF da folha resposta', 'Condutas esperadas em cada momento, pesos e mensagens-chave.', pdfFolha, setPdfFolha)}
          </div>
          <button type="button" className="botao botao-principal mt-5" disabled={!pdfCaso || !pdfFolha || etapa !== 'escolher'} onClick={montar}>
            {etapa === 'lendo' ? 'Lendo os PDFs…' : etapa === 'montando' ? 'A IA está montando o caso (até 4 minutos)…' : 'Montar o caso'}
          </button>
        </>
      )}

      {erro && (
        <p className="m-0 mt-4 text-perigosa" role="alert">
          {erro}
        </p>
      )}

      {etapa === 'pronto' && resultado && (
        <div className="mt-4 space-y-5">
          <div>
            <p className="m-0 text-sm text-texto-2">{resultado.caso.id}</p>
            <h3 className="m-0 mt-1 text-lg uppercase">{resultado.caso.caso?.identificacao?.titulo || 'Sem título'}</h3>
            <p className="m-0 mt-1 text-sm text-texto-2">
              {resultado.caso.caso?.momentos?.length ?? 0} momentos, {resultado.caso.caso?.regras?.length ?? 0} regras,{' '}
              {resultado.caso.caso?.desfechos?.length ?? 0} desfechos
            </p>
          </div>
          <ListaValidacao v={resultado.validacao} pendencias={resultado.pendencias} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="botao botao-secundario"
              disabled={resultado.validacao.erros.length > 0}
              title={resultado.validacao.erros.length ? 'Corrija os erros para jogar a prévia' : undefined}
              onClick={() => {
                registrarPrevia({ ...resultado.caso, publicado: true })
                navegar(`/caso/${resultado.caso.id}`)
              }}
            >
              Jogar prévia
            </button>
            <button type="button" className="botao botao-secundario" onClick={() => salvar(false)}>
              Salvar como rascunho
            </button>
            <button type="button" className="botao botao-principal" disabled={resultado.validacao.erros.length > 0} onClick={() => salvar(true)}>
              Publicar
            </button>
          </div>
          <div className="border-t border-borda pt-4 text-sm">
            <p className="m-0 text-texto-2">Para corrigir à mão: baixe o arquivo, edite e envie de volta.</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" className="botao botao-secundario" onClick={baixar}>
                Baixar o arquivo do caso
              </button>
              <label className="botao botao-secundario cursor-pointer">
                Enviar arquivo corrigido
                <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && trocarJson(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
