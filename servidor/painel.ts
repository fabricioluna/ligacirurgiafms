// /api/painel: tudo o que o painel do professor faz, protegido pelo código de acesso.
// Lê pelo servidor, com a conta de serviço; o navegador nunca lê o banco direto.

import { entrar, exigirAcesso } from './acesso.js'
import { firestoreAdmin } from './admin.js'
import { casosDoProjeto, esquecerCaso } from './casos.js'
import { gravarConfig, lerConfig } from './config.js'
import { extrairCaso } from './extrair.js'
import type { ChamarIA } from './gemini.js'
import { ErroPedido, type Contexto } from './http.js'
import { validarCaso } from './validarCaso.js'

const ms = (v: unknown): number | null => {
  const t = v as { toMillis?: () => number } | null | undefined
  return typeof t?.toMillis === 'function' ? t.toMillis() : typeof v === 'number' ? v : null
}

async function proximoId(): Promise<string> {
  const db = await firestoreAdmin()
  const nosso = casosDoProjeto.map((c) => Number(c.id.slice(5)))
  const doBanco = (await db.collection('casos').select().get()).docs.map((d) => Number(d.id.slice(5)))
  const n = Math.max(0, ...nosso, ...doBanco.filter(Number.isFinite)) + 1
  return `CASO-${String(n).padStart(3, '0')}`
}

export async function processarPainel(corpo: Record<string, unknown>, ctx: Contexto, ia: ChamarIA): Promise<unknown> {
  const acao = corpo.acao
  if (acao === 'entrar') return entrar(corpo.codigo, ctx.ip)

  exigirAcesso(corpo.token)
  const db = await firestoreAdmin()

  switch (acao) {
    case 'resumo': {
      const [tent, np, casosBanco, config] = await Promise.all([
        db.collection('tentativas').orderBy('atualizadaEm', 'desc').limit(300).get(),
        db.collection('respostas_nao_previstas').orderBy('em', 'desc').limit(500).get(),
        db.collection('casos').get(),
        lerConfig(),
      ])
      return {
        config,
        tentativas: tent.docs.map((d) => {
          const x = d.data()
          return {
            id: d.id,
            casoId: x.casoId,
            modo: x.modo,
            nomeInformado: x.nomeInformado ?? '',
            iniciadaEm: x.iniciadaEm ?? null,
            finalizadaEm: x.finalizadaEm ?? null,
            atualizadaEm: ms(x.atualizadaEm),
            notaFinal: x.notaFinal ?? null,
            desfecho: x.desfecho ?? null,
            qtdNaoPrevistas: x.qtdNaoPrevistas ?? 0,
            errosCriticos: x.errosCriticos ?? [],
            passos: (x.passos ?? []).map((p: Record<string, unknown>) => ({
              momento: p.momento,
              classificacao: p.classificacao,
              textoDoAluno: p.textoDoAluno ?? null,
            })),
          }
        }),
        naoPrevistas: np.docs.map((d) => {
          const x = d.data()
          return { id: d.id, casoId: x.casoId, momento: x.momento, textoDoAluno: x.textoDoAluno, revisada: x.revisada === true, em: ms(x.em) }
        }),
        casos: [
          ...casosDoProjeto.map((c) => ({
            id: c.id,
            titulo: c.caso.identificacao.titulo,
            origem: 'projeto',
            publicado: c.publicado === true,
            versao: c.versao,
            validacao: validarCaso(c),
            imagens: imagensDoCaso(c),
          })),
          ...casosBanco.docs.map((d) => {
            const x = d.data()
            let caso: unknown = null
            try {
              caso = JSON.parse(x.json)
            } catch {
              caso = null
            }
            return {
              id: d.id,
              titulo: x.titulo ?? d.id,
              origem: 'painel',
              publicado: x.publicado === true,
              versao: x.versao ?? '',
              atualizadoEm: ms(x.atualizadoEm),
              validacao: caso ? validarCaso(caso) : { erros: ['Caso ilegível no banco.'], avisos: [] },
              imagens: caso ? imagensDoCaso(caso as never) : [],
              caso,
            }
          }),
        ],
      }
    }

    case 'marcarRevisada': {
      if (typeof corpo.id !== 'string' || typeof corpo.revisada !== 'boolean') throw new ErroPedido('Pedido inválido.')
      await db.collection('respostas_nao_previstas').doc(corpo.id).update({ revisada: corpo.revisada })
      return { ok: true }
    }

    case 'contingencia': {
      if (typeof corpo.ativa !== 'boolean') throw new ErroPedido('Pedido inválido.')
      await gravarConfig({ contingencia: corpo.ativa })
      return { ok: true, contingencia: corpo.ativa }
    }

    case 'extrairCaso': {
      return extrairCaso(corpo.textoCaso, corpo.textoFolha, await proximoId(), ia)
    }

    case 'salvarCaso': {
      const caso = corpo.caso as Record<string, unknown> | undefined
      const publicar = corpo.publicar === true
      if (!caso || typeof caso !== 'object' || typeof caso.id !== 'string' || !/^CASO-\d{3}$/.test(caso.id)) throw new ErroPedido('Caso inválido.')
      if (casosDoProjeto.some((c) => c.id === caso.id)) throw new ErroPedido('Esse caso vem do projeto e não pode ser alterado pelo painel.')
      const validacao = validarCaso({ ...caso, publicado: publicar })
      if (publicar && validacao.erros.length) return { ok: false, validacao }
      const ref = db.collection('casos').doc(caso.id)
      const antes = await ref.get()
      const ident = (caso.caso as { identificacao?: { titulo?: string } } | undefined)?.identificacao
      await ref.set({
        json: JSON.stringify({ ...caso, publicado: publicar }),
        publicado: publicar,
        titulo: ident?.titulo ?? caso.id,
        versao: typeof caso.versao === 'string' ? caso.versao : '1.0',
        atualizadoEm: new Date(),
        ...(antes.exists ? {} : { criadoEm: new Date() }),
      })
      esquecerCaso(caso.id)
      return { ok: true, validacao }
    }

    case 'excluirCaso': {
      if (typeof corpo.id !== 'string' || casosDoProjeto.some((c) => c.id === corpo.id)) throw new ErroPedido('Caso inválido.')
      await db.collection('casos').doc(corpo.id).delete()
      esquecerCaso(corpo.id)
      return { ok: true }
    }

    default:
      throw new ErroPedido('Ação desconhecida.')
  }
}

// Imagens que o caso usa, com o arquivo esperado na pasta public/imagens/casos/<id>/.
export function imagensDoCaso(caso: {
  id: string
  caso: { exames: { id: string; nome: string; imagem?: { id?: string; arquivo: string; legenda?: string; quantidade?: number } }[]; momentos: { codigo: string; atualizaExames?: { id: string; imagem?: { id?: string; arquivo: string; legenda?: string; quantidade?: number } }[] }[] }
}) {
  const lista: { id: string; arquivos: string[]; exame: string; legenda: string }[] = []
  const add = (img: { id?: string; arquivo: string; legenda?: string; quantidade?: number }, exame: string) => {
    const arquivos = img.arquivo.endsWith('/')
      ? Array.from({ length: img.quantidade ?? 0 }, (_, i) => `${img.arquivo}${String(i + 1).padStart(2, '0')}.jpg`)
      : [img.arquivo]
    lista.push({ id: img.id ?? exame, arquivos: arquivos.map((a) => `/imagens/casos/${caso.id.toLowerCase()}/${a}`), exame, legenda: img.legenda ?? '' })
  }
  for (const e of caso.caso.exames) if (e.imagem) add(e.imagem, e.nome)
  for (const m of caso.caso.momentos) for (const u of m.atualizaExames ?? []) if (u.imagem) add(u.imagem, `${u.id} (${m.codigo})`)
  return lista
}
