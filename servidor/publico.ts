// /api/casos: o que qualquer aluno pode ver. Casos publicados pelo painel e o modo de contingência.
// Os casos do projeto já vêm junto com o site e não passam por aqui.

import { adminConfigurado } from './admin.js'
import { lerConfig } from './config.js'

export async function listarCasosPublicos() {
  const config = await lerConfig()
  if (!adminConfigurado()) return { config, casos: [] }
  try {
    const { firestoreAdmin } = await import('./admin.js')
    const docs = await (await firestoreAdmin()).collection('casos').where('publicado', '==', true).get()
    const casos = docs.docs.flatMap((d) => {
      try {
        return [JSON.parse(d.data().json)]
      } catch {
        return []
      }
    })
    return { config, casos }
  } catch {
    return { config, casos: [] }
  }
}
