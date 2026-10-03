// Testes das regras do Firestore no emulador local. Rodar com: npm run test:regras
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-simulador',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  })
})
afterAll(() => env?.cleanup())
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'professores/prof1'), { nome: 'Professor' })
  })
})

const aluno = () => env.authenticatedContext('aluno1').firestore()
const outroAluno = () => env.authenticatedContext('aluno2').firestore()
const professor = () => env.authenticatedContext('prof1').firestore()
const anonimo = () => env.unauthenticatedContext().firestore()

const tentativa = (uid = 'aluno1', extra: Record<string, unknown> = {}) => ({
  casoId: 'CASO-001',
  versaoCaso: '1.1',
  modo: 'ia',
  alunoUid: uid,
  nomeInformado: '',
  iniciadaEm: 1,
  caminho: ['M1'],
  passos: [],
  atualizadaEm: serverTimestamp(),
  ...extra,
})

const naoPrevista = (uid = 'aluno1', extra: Record<string, unknown> = {}) => ({
  casoId: 'CASO-001',
  momento: 'M1',
  textoDoAluno: 'dar chá de boldo',
  tentativaId: 't1',
  alunoUid: uid,
  revisada: false,
  em: serverTimestamp(),
  ...extra,
})

describe('tentativas', () => {
  it('aluno cria e atualiza a própria tentativa', async () => {
    await assertSucceeds(setDoc(doc(aluno(), 'tentativas/t1'), tentativa()))
    await assertSucceeds(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno1', { caminho: ['M1', 'M2'], notaFinal: 80 })))
    await assertSucceeds(getDoc(doc(aluno(), 'tentativas/t1')))
  })

  it('sem login não grava nem lê', async () => {
    await assertFails(setDoc(doc(anonimo(), 'tentativas/t1'), tentativa()))
    await setDoc(doc(aluno(), 'tentativas/t1'), tentativa())
    await assertFails(getDoc(doc(anonimo(), 'tentativas/t1')))
  })

  it('aluno não grava tentativa em nome de outro', async () => {
    await assertFails(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno2')))
  })

  it('aluno não lê nem altera a tentativa de outro', async () => {
    await setDoc(doc(aluno(), 'tentativas/t1'), tentativa())
    await assertFails(getDoc(doc(outroAluno(), 'tentativas/t1')))
    await assertFails(setDoc(doc(outroAluno(), 'tentativas/t1'), tentativa('aluno2')))
  })

  it('aluno não lista as tentativas da turma', async () => {
    await setDoc(doc(aluno(), 'tentativas/t1'), tentativa())
    await assertFails(getDocs(collection(outroAluno(), 'tentativas')))
  })

  it('professor lê e lista as tentativas', async () => {
    await setDoc(doc(aluno(), 'tentativas/t1'), tentativa())
    await assertSucceeds(getDoc(doc(professor(), 'tentativas/t1')))
    await assertSucceeds(getDocs(collection(professor(), 'tentativas')))
  })

  it('recusa campo desconhecido, modo inválido e nome grande', async () => {
    await assertFails(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno1', { admin: true })))
    await assertFails(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno1', { modo: 'outro' })))
    await assertFails(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno1', { nomeInformado: 'x'.repeat(81) })))
  })

  it('não muda a hora de início nem apaga', async () => {
    await setDoc(doc(aluno(), 'tentativas/t1'), tentativa())
    await assertFails(setDoc(doc(aluno(), 'tentativas/t1'), tentativa('aluno1', { iniciadaEm: 2 })))
    await assertFails(deleteDoc(doc(aluno(), 'tentativas/t1')))
  })
})

describe('respostas_nao_previstas', () => {
  it('aluno registra, mas não lê nem altera', async () => {
    await assertSucceeds(setDoc(doc(aluno(), 'respostas_nao_previstas/n1'), naoPrevista()))
    await assertFails(getDoc(doc(aluno(), 'respostas_nao_previstas/n1')))
    await assertFails(updateDoc(doc(aluno(), 'respostas_nao_previstas/n1'), { textoDoAluno: 'outro' }))
  })

  it('recusa registro em nome de outro, já revisado ou com texto grande', async () => {
    await assertFails(setDoc(doc(aluno(), 'respostas_nao_previstas/n1'), naoPrevista('aluno2')))
    await assertFails(setDoc(doc(aluno(), 'respostas_nao_previstas/n1'), naoPrevista('aluno1', { revisada: true })))
    await assertFails(setDoc(doc(aluno(), 'respostas_nao_previstas/n1'), naoPrevista('aluno1', { textoDoAluno: 'x'.repeat(401) })))
  })

  it('professor lê e marca como revisada, mas não muda o texto', async () => {
    await setDoc(doc(aluno(), 'respostas_nao_previstas/n1'), naoPrevista())
    await assertSucceeds(getDocs(collection(professor(), 'respostas_nao_previstas')))
    await assertSucceeds(updateDoc(doc(professor(), 'respostas_nao_previstas/n1'), { revisada: true }))
    await assertFails(updateDoc(doc(professor(), 'respostas_nao_previstas/n1'), { textoDoAluno: 'editado' }))
  })
})

describe('professores e casos', () => {
  it('ninguém se promove a professor', async () => {
    await assertFails(setDoc(doc(aluno(), 'professores/aluno1'), { nome: 'eu' }))
  })

  it('aluno não escreve casos; professor escreve', async () => {
    await assertFails(setDoc(doc(aluno(), 'casos/CASO-002'), { publicado: true }))
    await assertSucceeds(setDoc(doc(professor(), 'casos/CASO-002'), { publicado: false }))
    await assertFails(getDoc(doc(aluno(), 'casos/CASO-002')))
  })

  it('coleções não previstas nas regras ficam fechadas', async () => {
    await assertFails(setDoc(doc(aluno(), 'qualquer/x'), { a: 1 }))
  })
})
