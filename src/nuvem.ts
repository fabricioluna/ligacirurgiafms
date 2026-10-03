// Firebase: gravação das tentativas e das condutas não previstas, sem login.
// Tudo aqui é opcional e silencioso: sem configuração, sem internet ou com erro, o simulador
// segue funcionando normalmente, só não guarda na nuvem.
// O Firebase é carregado depois da página, para não atrasar a abertura nem o modo sem internet.
//
// A configuração do Firebase web (VITE_FIREBASE_*) não é segredo: ela identifica o projeto.
// Quem protege os dados são as regras em firestore.rules: o navegador só grava, nunca lê.

import { gravar, ler } from './armazenamento'
import { calcularNota } from './motor/nota'
import type { Caso, Tentativa } from './motor/tipos'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const nuvemConfigurada = Boolean(config.apiKey && config.projectId && config.appId)

// Identifica o aparelho (não a pessoa), para o histórico daquele aparelho.
export function aparelhoId(): string {
  const salvo = ler<string>('simulador:aparelho')
  if (salvo) return salvo
  const novo = crypto.randomUUID()
  gravar('simulador:aparelho', novo)
  return novo
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

type Conexao = {
  fs: typeof import('firebase/firestore')
  db: import('firebase/firestore').Firestore
}

let conexao: Promise<Conexao | null> | null = null

function conectar(): Promise<Conexao | null> {
  if (!nuvemConfigurada) return Promise.resolve(null)
  if (!conexao) {
    conexao = (async () => {
      try {
        const [{ initializeApp }, fs] = await Promise.all([import('firebase/app'), import('firebase/firestore')])
        const db = fs.getFirestore(initializeApp(config))
        // Só para testes no computador: usa o emulador local do Firebase.
        if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULADOR === '1') {
          fs.connectFirestoreEmulator(db, '127.0.0.1', 8085)
        }
        return { fs, db }
      } catch (e) {
        console.warn('[nuvem] sem conexão com o Firebase', e)
        conexao = null // tenta de novo na próxima gravação
        return null
      }
    })()
  }
  return conexao
}

function dadosDaTentativa(caso: Caso, t: Tentativa) {
  const nota = calcularNota(caso, t.passos)
  return {
    casoId: t.casoId,
    versaoCaso: t.versaoCaso,
    modo: t.modo,
    aparelhoId: aparelhoId(),
    nomeInformado: t.nomeInformado.slice(0, 80),
    iniciadaEm: t.iniciadaEm,
    finalizadaEm: t.finalizadaEm ?? null,
    caminho: t.caminho,
    passos: t.passos.map((p) => ({
      momento: p.momento,
      textoDoAluno: p.textoDoAluno ?? null,
      selecionados: p.selecionados,
      classificacao: p.classificacao,
      itemDaFolha: p.itemDaFolha,
      regraAplicada: p.regraAplicada,
      errosCriticos: p.errosCriticos,
      em: p.em,
    })),
    notaFinal: t.desfecho ? nota.final : null,
    notaPorMomento: nota.porMomento.map((n) => ({ momento: n.momento, pontos: n.pontos, peso: n.peso })),
    errosCriticos: t.passos.flatMap((p) => p.errosCriticos),
    desfecho: t.desfecho ?? null,
    qtdNaoPrevistas: t.naoPrevistas.length,
  }
}

// Grava a tentativa (sempre o mesmo documento) e as condutas não previstas novas.
// Os ids são fixos, então gravar de novo não duplica nada.
export async function sincronizar(caso: Caso, t: Tentativa, naoPrevistasJaEnviadas: number): Promise<number> {
  // Tentativas antigas, de antes do id aleatório, ficam só no aparelho.
  if (!UUID.test(t.id)) return naoPrevistasJaEnviadas
  const c = await conectar()
  if (!c) return naoPrevistasJaEnviadas
  const { fs, db } = c
  try {
    await fs.setDoc(fs.doc(db, 'tentativas', t.id), { ...dadosDaTentativa(caso, t), atualizadaEm: fs.serverTimestamp() })
  } catch (e) {
    console.warn('[nuvem] tentativa não gravada', e)
  }
  let enviadas = naoPrevistasJaEnviadas
  for (let i = naoPrevistasJaEnviadas; i < t.naoPrevistas.length; i++) {
    const n = t.naoPrevistas[i]
    try {
      await fs.setDoc(fs.doc(db, 'respostas_nao_previstas', `${t.id}-${i}`), {
        casoId: t.casoId,
        momento: n.momento,
        textoDoAluno: n.texto.slice(0, 400),
        tentativaId: t.id,
        revisada: false,
        em: fs.serverTimestamp(),
      })
      enviadas = i + 1
    } catch (e) {
      // Já gravada antes (as regras não deixam reescrever) ou sem conexão.
      if ((e as { code?: string }).code === 'permission-denied') enviadas = i + 1
      else break
    }
  }
  return enviadas
}
