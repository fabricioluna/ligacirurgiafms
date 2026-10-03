// Confere a integridade dos casos: estrutura, referências e todos os caminhos.
import { describe, expect, it } from 'vitest'
import Ajv from 'ajv'
import schema from '../casos/caso-schema.json'
import bruto from '../casos/caso-001.json'
import type { Caso, Condicao } from '../src/motor/tipos'
import { categoriaDoItem, todosOsItens } from '../src/motor/avaliacao'
import { ehDesfecho, momentoFolha } from '../src/motor/caso'

const caso = bruto as Caso

describe('caso-001: estrutura', () => {
  it('segue o caso-schema.json', () => {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const valido = ajv.validate(schema, bruto)
    expect(ajv.errors ?? []).toEqual([])
    expect(valido).toBe(true)
  })

  it('cada momento tem folha resposta e peso', () => {
    for (const m of caso.caso.momentos) {
      expect(() => momentoFolha(caso, m.codigo)).not.toThrow()
      expect(caso.folhaResposta.pesos[m.codigo.replace(/-ALT$/, '')]).toBeGreaterThan(0)
    }
  })

  it('os pesos somam 100', () => {
    expect(Object.values(caso.folhaResposta.pesos).reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('nenhum item aparece em duas categorias do mesmo momento', () => {
    for (const f of caso.folhaResposta.momentos) {
      const itens = todosOsItens(f)
      expect(new Set(itens).size, f.codigo).toBe(itens.length)
    }
  })
})

describe('caso-001: referências', () => {
  const codigos = new Set([...caso.caso.momentos.map((m) => m.codigo), ...caso.caso.desfechos.map((d) => d.codigo)])
  const ids = new Set([
    ...caso.caso.anamnese.map((a) => a.id),
    ...caso.caso.exameFisico.map((e) => e.id),
    ...caso.caso.exames.map((e) => e.id),
  ])

  const conferirCondicao = (codigo: string, c: Condicao) => {
    const f = momentoFolha(caso, codigo)
    for (const item of [...(c.selecionados ?? []), ...(c.nenhumSelecionado ?? [])]) {
      expect(categoriaDoItem(f, item), `${codigo}: "${item}"`).not.toBeNull()
    }
    for (const id of [...(c.revelados ?? []), ...(c.naoRevelados ?? [])]) expect(ids.has(id), id).toBe(true)
  }

  it('próximo de cada momento existe', () => {
    for (const m of caso.caso.momentos) if (m.proximo) expect(codigos.has(m.proximo), m.codigo).toBe(true)
  })

  it('regras apontam para momentos, desfechos e itens que existem', () => {
    for (const r of caso.caso.regras) {
      expect(codigos.has(r.momento), r.codigo).toBe(true)
      expect(codigos.has(r.vaiPara), r.codigo).toBe(true)
      if (r.marcaDesfecho) expect(ehDesfecho(r.marcaDesfecho) && codigos.has(r.marcaDesfecho), r.codigo).toBe(true)
      expect(Boolean(r.disparadaPor?.length || r.quando), `${r.codigo} sem gatilho`).toBe(true)
      const f = momentoFolha(caso, r.momento)
      for (const item of r.disparadaPor ?? []) expect(categoriaDoItem(f, item), `${r.codigo}: "${item}"`).not.toBeNull()
      if (r.quando) conferirCondicao(r.momento, r.quando)
    }
  })

  it('itens derivados e rótulos do modo de lista existem na folha', () => {
    for (const f of caso.folhaResposta.momentos) {
      for (const d of f.modoLista?.derivados ?? []) {
        expect(categoriaDoItem(f, d.item), `${f.codigo}: "${d.item}"`).not.toBeNull()
        conferirCondicao(f.codigo, d.quando)
      }
      for (const item of Object.keys(f.modoLista?.rotulos ?? {})) {
        expect(categoriaDoItem(f, item), `${f.codigo}: "${item}"`).not.toBeNull()
      }
    }
  })

  it('atualizações de exame apontam para exames que existem', () => {
    for (const m of caso.caso.momentos) {
      for (const u of [...(m.atualizaExames ?? []), ...(m.atualizaExameFisico ?? [])]) {
        expect(ids.has(u.id), `${m.codigo} ${u.id}`).toBe(true)
      }
    }
  })

  it('todos os momentos e desfechos podem ser alcançados', () => {
    const alcancaveis = new Set([caso.caso.momentos[0].codigo])
    let mudou = true
    while (mudou) {
      mudou = false
      for (const cod of [...alcancaveis]) {
        const m = caso.caso.momentos.find((x) => x.codigo === cod)
        const regras = caso.caso.regras.filter((r) => r.momento === cod)
        for (const d of [m?.proximo, ...regras.flatMap((r) => [r.vaiPara, r.marcaDesfecho])]) {
          if (d && !alcancaveis.has(d)) {
            alcancaveis.add(d)
            mudou = true
          }
        }
      }
    }
    expect([...codigos].filter((c) => !alcancaveis.has(c))).toEqual([])
  })
})
