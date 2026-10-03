// Validação completa de um caso antes de salvar ou publicar: estrutura (caso-schema.json) e integridade.

import Ajv from 'ajv'
import schema from '../casos/caso-schema.json' with { type: 'json' }
import type { Caso } from '../src/motor/tipos.js'
import { validarIntegridade, type Validacao } from '../src/motor/validacao.js'

const ajv = new Ajv({ allErrors: true, strict: false })
const validarEstrutura = ajv.compile(schema)

export function validarCaso(caso: unknown): Validacao {
  if (!validarEstrutura(caso)) {
    const erros = (validarEstrutura.errors ?? []).slice(0, 30).map((e) => `Estrutura: ${e.instancePath || '(raiz)'} ${e.message ?? ''}`.trim())
    return { erros, avisos: [] }
  }
  try {
    return validarIntegridade(caso as unknown as Caso)
  } catch (e) {
    return { erros: [`Não foi possível conferir o caso: ${(e as Error).message}`], avisos: [] }
  }
}
