// Acesso do servidor ao Firestore, com a conta de serviço (FIREBASE_SERVICE_ACCOUNT).
// Só o servidor tem essa credencial: o navegador nunca lê o banco.
// Nos testes, FIRESTORE_EMULATOR_HOST aponta para o emulador local.

import type { Firestore } from 'firebase-admin/firestore'
import { ErroPedido } from './http.js'

let banco: Promise<Firestore> | null = null

// Sem credencial (nem emulador), nem tenta carregar o Firebase Admin.
export const adminConfigurado = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIRESTORE_EMULATOR_HOST)

export function firestoreAdmin(): Promise<Firestore> {
  if (!banco) {
    banco = (async () => {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app')
      const { getFirestore } = await import('firebase-admin/firestore')
      if (!getApps().length) {
        if (process.env.FIRESTORE_EMULATOR_HOST) {
          initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-simulador' })
        } else {
          const bruto = process.env.FIREBASE_SERVICE_ACCOUNT
          if (!bruto) throw new ErroPedido('O painel ainda não está configurado: falta FIREBASE_SERVICE_ACCOUNT.', 503)
          let conta: Record<string, string>
          try {
            conta = JSON.parse(bruto.trim().startsWith('{') ? bruto : Buffer.from(bruto, 'base64').toString('utf8'))
          } catch {
            throw new ErroPedido('FIREBASE_SERVICE_ACCOUNT não é um JSON válido.', 503)
          }
          initializeApp({ credential: cert(conta as never) })
        }
      }
      return getFirestore()
    })().catch((e) => {
      banco = null
      throw e
    })
  }
  return banco
}
