// Testes das regras do Firestore no emulador local. Rodar com: npm run test:regras
// Modelo aberto: o navegador só grava; ninguém lê pelo navegador.
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-simulador',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  })
})
afterAll(() => env?.cleanup())
beforeEach(() => env.clearFirestore())

const db = () => env.unauthenticatedContext().firestore()
const ID = '3f2b8c1e-9a4d-4f6b-8e2a-1c5d7e9f0a1b'

const tentativa = (extra: Record<string, unknown> = {}) => ({
  casoId: 'CASO-001',
  versaoCaso: '1.1',
  modo: 'ia',
  aparelhoId: 'aparelho-1',
  nomeInformado: '',
  iniciadaEm: 1,
  caminho: ['M1'],
  passos: [],
  errosCriticos: [],
  atualizadaEm: serverTimestamp(),
  ...extra,
})

const naoPrevista = (extra: Record<string, unknown> = {}) => ({
  casoId: 'CASO-001',
  momento: 'M1',
  textoDoAluno: 'dar chá de boldo',
  tentativaId: ID,
  revisada: false,
  em: serverTimestamp(),
  ...extra,
})

describe('tentativas', () => {
  it('cria e atualiza sem login', async () => {
    await assertSucceeds(setDoc(doc(db(), 'tentativas', ID), tentativa()))
    await assertSucceeds(setDoc(doc(db(), 'tentativas', ID), tentativa({ caminho: ['M1', 'M2'], notaFinal: 80 })))
  })

  it('ninguém lê nem lista tentativas pelo navegador', async () => {
    await setDoc(doc(db(), 'tentativas', ID), tentativa())
    await assertFails(getDoc(doc(db(), 'tentativas', ID)))
    await assertFails(getDocs(collection(db(), 'tentativas')))
  })

  it('id precisa ser aleatório (UUID)', async () => {
    await assertFails(setDoc(doc(db(), 'tentativas', 'abc'), tentativa()))
  })

  it('recusa campo desconhecido, modo inválido e nome grande', async () => {
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ admin: true })))
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ modo: 'outro' })))
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ nomeInformado: 'x'.repeat(81) })))
  })

  it('não muda o aparelho, o caso nem a hora de início, e não apaga', async () => {
    await setDoc(doc(db(), 'tentativas', ID), tentativa())
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ aparelhoId: 'outro' })))
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ iniciadaEm: 2 })))
    await assertFails(setDoc(doc(db(), 'tentativas', ID), tentativa({ casoId: 'CASO-002' })))
    await assertFails(deleteDoc(doc(db(), 'tentativas', ID)))
  })
})

describe('respostas_nao_previstas', () => {
  it('registra, mas não lê, não altera e não apaga', async () => {
    await assertSucceeds(setDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`), naoPrevista()))
    await assertFails(getDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`)))
    await assertFails(getDocs(collection(db(), 'respostas_nao_previstas')))
    await assertFails(updateDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`), { revisada: true }))
    await assertFails(deleteDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`)))
  })

  it('não reescreve um registro que já existe', async () => {
    await setDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`), naoPrevista())
    await assertFails(setDoc(doc(db(), 'respostas_nao_previstas', `${ID}-0`), naoPrevista({ textoDoAluno: 'outro' })))
  })

  it('recusa já revisado, texto vazio ou grande e campo extra', async () => {
    await assertFails(setDoc(doc(db(), 'respostas_nao_previstas', 'n1'), naoPrevista({ revisada: true })))
    await assertFails(setDoc(doc(db(), 'respostas_nao_previstas', 'n1'), naoPrevista({ textoDoAluno: '' })))
    await assertFails(setDoc(doc(db(), 'respostas_nao_previstas', 'n1'), naoPrevista({ textoDoAluno: 'x'.repeat(401) })))
    await assertFails(setDoc(doc(db(), 'respostas_nao_previstas', 'n1'), naoPrevista({ nota: 10 })))
  })
})

describe('demais coleções', () => {
  it('ficam fechadas', async () => {
    await assertFails(setDoc(doc(db(), 'professores/eu'), { nome: 'eu' }))
    await assertFails(setDoc(doc(db(), 'casos/CASO-002'), { publicado: true }))
    await assertFails(getDoc(doc(db(), 'casos/CASO-001')))
  })
})
