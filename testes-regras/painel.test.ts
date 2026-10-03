// Painel do professor contra o emulador do Firestore (npm run test:regras).
import { beforeAll, describe, expect, it } from 'vitest'
import caso001 from '../casos/caso-001.json'

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085'
process.env.GCLOUD_PROJECT = 'demo-simulador'
process.env.PAINEL_CODIGO = 'codigo-de-teste-123'

const { processarPainel } = await import('../servidor/painel')
const { firestoreAdmin } = await import('../servidor/admin')
const { exigirIALigada } = await import('../servidor/config')
const { casoPublicado } = await import('../servidor/casos')
const { listarCasosPublicos } = await import('../servidor/publico')

const ctx = { ip: '10.0.0.1' }
const ia = async () => ({})
const painel = (corpo: Record<string, unknown>) => processarPainel(corpo, ctx, ia)
let token = ''

beforeAll(async () => {
  const db = await firestoreAdmin()
  await db.collection('tentativas').doc('3f2b8c1e-9a4d-4f6b-8e2a-1c5d7e9f0a1b').set({
    casoId: 'CASO-001', modo: 'ia', nomeInformado: 'Aluna', iniciadaEm: 1, atualizadaEm: new Date(), notaFinal: 80, passos: [{ momento: 'M1', classificacao: 'ideal' }],
  })
  await db.collection('respostas_nao_previstas').doc('n1').set({ casoId: 'CASO-001', momento: 'M1', textoDoAluno: 'chá de boldo', revisada: false, em: new Date() })
})

describe('acesso por código', () => {
  it('recusa código errado e sem código', async () => {
    await expect(painel({ acao: 'entrar', codigo: 'errado' })).rejects.toThrow('Código incorreto')
    await expect(painel({ acao: 'resumo' })).rejects.toThrow('Entre com o código')
    await expect(painel({ acao: 'resumo', token: '9999999999999.falsificado' })).rejects.toThrow('Acesso inválido')
  })

  it('aceita o código certo', async () => {
    const r = (await painel({ acao: 'entrar', codigo: 'codigo-de-teste-123' })) as { token: string }
    token = r.token
    expect(token).toMatch(/^\d+\./)
  })
})

describe('dados do painel', () => {
  it('lista tentativas, não previstas e casos', async () => {
    const r = (await painel({ acao: 'resumo', token })) as {
      tentativas: { nomeInformado: string; notaFinal: number }[]
      naoPrevistas: { textoDoAluno: string; revisada: boolean }[]
      casos: { id: string; origem: string }[]
    }
    expect(r.tentativas[0]).toMatchObject({ nomeInformado: 'Aluna', notaFinal: 80 })
    expect(r.naoPrevistas[0]).toMatchObject({ textoDoAluno: 'chá de boldo', revisada: false })
    expect(r.casos.some((c) => c.id === 'CASO-001' && c.origem === 'projeto')).toBe(true)
  })

  it('marca não prevista como revisada', async () => {
    await painel({ acao: 'marcarRevisada', token, id: 'n1', revisada: true })
    const d = (await (await firestoreAdmin()).collection('respostas_nao_previstas').doc('n1').get()).data()
    expect(d?.revisada).toBe(true)
  })

  it('o interruptor de contingência desliga a IA para todos', async () => {
    await painel({ acao: 'contingencia', token, ativa: true })
    await expect(exigirIALigada()).rejects.toThrow('contingencia')
    expect((await listarCasosPublicos()).config.contingencia).toBe(true)
    await painel({ acao: 'contingencia', token, ativa: false })
    await expect(exigirIALigada()).resolves.toBeUndefined()
  })
})

describe('cadastro de casos', () => {
  const novo = { ...structuredClone(caso001), id: 'CASO-010', publicado: false }

  it('não deixa alterar um caso do projeto', async () => {
    await expect(painel({ acao: 'salvarCaso', token, caso: { ...caso001 } })).rejects.toThrow('vem do projeto')
  })

  it('não publica caso com erro, mas salva como rascunho', async () => {
    const quebrado = structuredClone(novo)
    quebrado.folhaResposta.pesos.M1 = 1
    const r = (await painel({ acao: 'salvarCaso', token, caso: quebrado, publicar: true })) as { ok: boolean; validacao: { erros: string[] } }
    expect(r.ok).toBe(false)
    expect(r.validacao.erros.join(' ')).toMatch(/somam/)
    expect((await painel({ acao: 'salvarCaso', token, caso: quebrado, publicar: false })) as { ok: boolean }).toMatchObject({ ok: true })
    expect(await casoPublicado('CASO-010')).toBeUndefined()
  })

  it('publica caso válido, que passa a funcionar no simulador', async () => {
    const r = (await painel({ acao: 'salvarCaso', token, caso: novo, publicar: true })) as { ok: boolean }
    expect(r.ok).toBe(true)
    expect((await casoPublicado('CASO-010'))?.id).toBe('CASO-010')
    expect((await listarCasosPublicos()).casos.map((c: { id: string }) => c.id)).toContain('CASO-010')
  })

  it('exclui caso do painel', async () => {
    await painel({ acao: 'excluirCaso', token, id: 'CASO-010' })
    expect(await casoPublicado('CASO-010')).toBeUndefined()
  })
})
