// Vale para todos os casos do projeto: estrutura, integridade, caminho ideal e regras.
import { describe, expect, it } from 'vitest'
import Ajv from 'ajv'
import schema from '../casos/caso-schema.json'
import c1 from '../casos/caso-001.json'
import c2 from '../casos/caso-002.json'
import c3 from '../casos/caso-003.json'
import type { Caso, Tentativa } from '../src/motor/tipos'
import { avaliarConduta, opcoesDoMomento } from '../src/motor/avaliacao'
import { exameDisponivel, momentoFolha, temaParaAluno } from '../src/motor/caso'
import { calcularNota } from '../src/motor/nota'
import { definirConduta, novaTentativa, registrarDiagnostico, revelar, seguir } from '../src/motor/tentativa'
import { precisaDiagnostico } from '../src/motor/diagnostico'
import { validarIntegridade } from '../src/motor/validacao'

const casos = [c1, c2, c3].map((c) => c as unknown as Caso)
const ajv = new Ajv({ allErrors: true, strict: false })

function revelarTudo(caso: Caso, t: Tentativa) {
  for (const a of caso.caso.anamnese) t = revelar(caso, t, 'anamnese', a.id)
  for (const e of caso.caso.exameFisico) t = revelar(caso, t, 'exameFisico', e.id)
  for (const e of caso.caso.exames) if (exameDisponivel(caso, e, t.momentoAtual)) t = revelar(caso, t, 'exames', e.id)
  return t
}

const idealComoOpcao = (caso: Caso, codigo: string) => {
  const opcoes = new Set(opcoesDoMomento(caso, codigo, 'teste').map((o) => o.item))
  return momentoFolha(caso, codigo).ideal.filter((i) => opcoes.has(i))
}

const todosOsIds = (caso: Caso) =>
  new Set([...caso.caso.anamnese, ...caso.caso.exameFisico, ...caso.caso.exames].map((i) => i.id))

describe.each(casos.map((c) => [c.id, c] as const))('%s', (_id, caso) => {
  it('segue o caso-schema.json', () => {
    ajv.validate(schema, caso)
    expect(ajv.errors ?? []).toEqual([])
  })

  it('não tem erro de integridade', () => {
    expect(validarIntegridade(caso).erros).toEqual([])
  })

  it('o caminho ideal chega ao desfecho ótimo com nota 100', () => {
    let t = revelarTudo(caso, novaTentativa(caso))
    let voltas = 0
    while (!t.desfecho && voltas++ < 12) {
      if (precisaDiagnostico(caso, t)) t = registrarDiagnostico(caso, t, caso.folhaResposta.diagnostico!.correto, 'teste')
      t = definirConduta(caso, t, idealComoOpcao(caso, t.momentoAtual))
      expect(t.passos.at(-1)!.classificacao, t.momentoAtual).toBe('ideal')
      t = seguir(t)
      t = revelarTudo(caso, t)
    }
    const d = caso.caso.desfechos.find((x) => x.codigo === t.desfecho)
    expect(d?.qualidade).toBe('otimo')
    expect(calcularNota(caso, t.passos, t.diagnostico).final).toBe(100)
  })

  it('cada regra dispara quando a conduta que a aciona é escolhida', () => {
    for (const r of caso.caso.regras.filter((x) => x.disparadaPor?.length)) {
      for (const gatilho of r.disparadaPor!) {
        const res = avaliarConduta(caso, r.momento, [...idealComoOpcao(caso, r.momento), gatilho], todosOsIds(caso))
        expect(res.regra?.codigo, `${r.codigo} com "${gatilho}"`).toBe(r.codigo)
        expect(res.proximo).toBe(r.vaiPara)
      }
    }
  })

  it('tem hipótese diagnóstica sem repetições, pedida num momento que existe', () => {
    const dx = caso.folhaResposta.diagnostico!
    expect(caso.caso.momentos.some((m) => m.codigo === dx.momento)).toBe(true)
    const todas = [dx.correto, ...dx.parciais, ...dx.incorretos]
    expect(new Set(todas).size).toBe(todas.length)
    expect(dx.incorretos.length).toBeGreaterThanOrEqual(3)
  })

  it('o que aparece antes do caso não entrega o diagnóstico', () => {
    const { titulo, tema } = caso.caso.identificacao
    expect(tema, 'tema no formato "Área geral: diagnóstico"').toContain(':')
    const diagnostico = tema.split(':').slice(1).join(':').toLowerCase()
    const palavras = (diagnostico.match(/[a-zà-ú]{5,}/g) ?? []).filter((p) => !['obstrução', 'abdome', 'agudo'].includes(p))
    const antes = `${titulo} ${temaParaAluno(tema)}`.toLowerCase()
    for (const p of palavras) expect(antes, `"${p}" aparece antes do caso`).not.toContain(p.slice(0, 6))
  })

  it('nenhuma opção da lista entrega a resposta pelo texto', () => {
    // Palavras que denunciam a classificação não podem aparecer nas opções mostradas ao aluno.
    const entregam = /\b(sem motivo|desnecessári|apesar d|indevid|sem investigar|atrasando|em vez de)\b/i
    for (const m of caso.folhaResposta.momentos) {
      for (const o of opcoesDoMomento(caso, m.codigo, 'teste')) expect(o.rotulo, `${m.codigo}: ${o.rotulo}`).not.toMatch(entregam)
    }
  })
})
