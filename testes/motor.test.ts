// Joga o caso-001 por caminhos completos e confere classificação, evolução, desfecho e nota.
import { describe, expect, it } from 'vitest'
import bruto from '../casos/caso-001.json'
import type { Caso, Tentativa } from '../src/motor/tipos'
import { avaliarConduta, opcoesDoMomento } from '../src/motor/avaliacao'
import { definirConduta, idsRevelados, novaTentativa, registrarDiagnostico, revelar, seguir } from '../src/motor/tentativa'
import { precisaDiagnostico } from '../src/motor/diagnostico'
import { calcularNota } from '../src/motor/nota'
import { exameDisponivel, examesAtuais, momentoFolha } from '../src/motor/caso'

const caso = bruto as unknown as Caso
const folha = (c: string) => momentoFolha(caso, c)
const sub = (c: string, i: number) => folha(c).subotimas![i].conduta

function revelarTudoDoM1(t: Tentativa) {
  for (const a of caso.caso.anamnese) t = revelar(caso, t, 'anamnese', a.id)
  for (const e of caso.caso.exameFisico) t = revelar(caso, t, 'exameFisico', e.id)
  for (const e of caso.caso.exames) if (exameDisponivel(caso, e, 'M1')) t = revelar(caso, t, 'exames', e.id)
  return t
}

// Marca todos os itens ideais que aparecem como opção.
function condutaIdeal(t: Tentativa) {
  const opcoes = new Set(opcoesDoMomento(caso, t.momentoAtual, t.id).map((o) => o.item))
  return folha(t.momentoAtual).ideal.filter((i) => opcoes.has(i))
}

// Registra a hipótese correta quando o momento pede, antes da conduta.
const comDiagnostico = (t: Tentativa) =>
  precisaDiagnostico(caso, t) ? registrarDiagnostico(caso, t, caso.folhaResposta.diagnostico!.correto, 'teste') : t
const jogar = (t: Tentativa, selecionados: string[]) => seguir(definirConduta(caso, comDiagnostico(t), selecionados))

const ate = (alvo: string) => {
  let t = revelarTudoDoM1(novaTentativa(caso))
  while (t.momentoAtual !== alvo) t = jogar(t, condutaIdeal(t))
  return t
}

describe('caminho ideal', () => {
  it('chega ao D1 com nota 100', () => {
    let t = revelarTudoDoM1(novaTentativa(caso))
    for (const esperado of ['M1', 'M2', 'M3', 'M4', 'M5']) {
      expect(t.momentoAtual).toBe(esperado)
      t = definirConduta(caso, comDiagnostico(t), condutaIdeal(t))
      expect(t.passos.at(-1)!.classificacao, esperado).toBe('ideal')
      t = seguir(t)
    }
    expect(t.desfecho).toBe('D1')
    expect(calcularNota(caso, t.passos, t.diagnostico)).toMatchObject({ final: 100, faixa: 'Excelente' })
  })
})

describe('M1', () => {
  it('sem examinar os orifícios herniários é erro crítico, e sem TC aciona R2', () => {
    const t = novaTentativa(caso)
    const r = avaliarConduta(caso, 'M1', condutaIdeal(t), new Set())
    expect(r.classificacao).toBe('perigosa')
    expect(r.errosCriticos).toContain(folha('M1').errosCriticos[1])
    expect(r.regra?.codigo).toBe('R2')
    expect(r.proximo).toBe('M2')
  })

  it('não marcar a reposição de potássio é subótima', () => {
    const t = revelarTudoDoM1(novaTentativa(caso))
    const sem = condutaIdeal(t).filter((i) => i !== folha('M1').ideal[3])
    const r = avaliarConduta(caso, 'M1', sem, idsRevelados(t))
    expect(r.classificacao).toBe('subotima')
    expect(r.itemDaFolha).toBe(sub('M1', 1))
  })

  it('dar alta leva a M3-ALT e termina em D4, mesmo conduzindo bem o resto', () => {
    let t = comDiagnostico(revelarTudoDoM1(novaTentativa(caso)))
    t = definirConduta(caso, t, [...condutaIdeal(t), folha('M1').errosCriticos[0]])
    expect(t.passos.at(-1)).toMatchObject({ classificacao: 'perigosa', regraAplicada: 'R1', proximo: 'M3-ALT' })
    t = seguir(t)
    t = jogar(t, condutaIdeal(t))
    expect(t.momentoAtual).toBe('M4-ALT')
    t = jogar(t, condutaIdeal(t))
    expect(t.desfecho).toBe('D4')
  })

  it('condutas opostas na mesma resposta: vale a mais grave', () => {
    const t = revelarTudoDoM1(novaTentativa(caso))
    const r = avaliarConduta(caso, 'M1', [...condutaIdeal(t), folha('M1').errosCriticos[3]], idsRevelados(t))
    expect(r.classificacao).toBe('perigosa')
  })

  it('pedir o mesmo exame duas vezes no mesmo momento não duplica o histórico', () => {
    let t = novaTentativa(caso)
    t = revelar(caso, t, 'exames', 'EX-01')
    t = revelar(caso, t, 'exames', 'EX-01')
    expect(t.descobertas).toHaveLength(1)
  })
})

describe('M2 a M5', () => {
  it('cirurgia imediata no M2 termina em D2 e a nota conta só os momentos jogados', () => {
    const t = jogar(ate('M2'), [sub('M2', 0)])
    expect(t.desfecho).toBe('D2')
    // Condutas: M1 ideal (20 de 20) + M2 subótima (10 de 20) = 75%. Diagnóstico correto vale 10% da nota: 75 x 0,9 + 100 x 0,1
    expect(calcularNota(caso, t.passos, t.diagnostico).final).toBe(78)
  })

  it('conservador sem contraste é aceitável; sem prazo é subótima (R4)', () => {
    const [i0, , , i3, i4] = folha('M2').ideal
    expect(avaliarConduta(caso, 'M2', [i0, i3, i4], new Set()).classificacao).toBe('aceitavel')
    const r = avaliarConduta(caso, 'M2', [i0, i3], new Set())
    expect(r).toMatchObject({ classificacao: 'subotima', proximo: 'M3' })
    expect(r.regra?.codigo).toBe('R4')
  })

  it('dar alta no M2 leva ao choque e termina em D4', () => {
    let t = jogar(ate('M2'), [folha('M2').errosCriticos[1]])
    expect(t.momentoAtual).toBe('M3-ALT')
    t = jogar(jogar(t, condutaIdeal(t)), condutaIdeal(t))
    expect(t.desfecho).toBe('D4')
  })

  it('no M3, não indicar cirurgia é erro crítico e leva ao choque', () => {
    const r = avaliarConduta(caso, 'M3', [folha('M3').ideal[0], folha('M3').ideal[2]], new Set())
    expect(r.classificacao).toBe('perigosa')
    expect(r.regra?.codigo).toBe('R5')
    expect(r.proximo).toBe('M3-ALT')
  })

  it('no M3 o resultado do contraste já está atualizado e disponível', () => {
    const t = ate('M3')
    const ex14 = examesAtuais(caso, t.caminho).find((e) => e.id === 'EX-14')!
    expect(ex14.resultado).toMatch(/sem chegar ao cólon/)
    expect(exameDisponivel(caso, ex14, 'M3')).toBe(true)
    expect(exameDisponivel(caso, ex14, 'M2')).toBe(false)
    expect(exameDisponivel(caso, ex14, 'M3-ALT')).toBe(false)
  })

  it('no M4, ressecar sem a pausa é subótima e não ressecar leva a D3', () => {
    const [, i1, , i3, i4] = folha('M4').ideal
    expect(avaliarConduta(caso, 'M4', [i1, i3, i4], new Set()).classificacao).toBe('subotima')
    expect(avaliarConduta(caso, 'M4', [i1, i4], new Set())).toMatchObject({ classificacao: 'perigosa', proximo: 'D3' })
  })

  it('opções derivadas não aparecem na lista, e os rótulos substituem o texto', () => {
    const opcoes = opcoesDoMomento(caso, 'M1', 'x')
    expect(opcoes.some((o) => o.item === folha('M1').errosCriticos[1])).toBe(false)
    expect(opcoes.find((o) => o.item === folha('M1').errosCriticos[0])!.rotulo).toBe('Tratar como gastroenterite e dar alta.')
    expect(opcoesDoMomento(caso, 'M1', 'x')).toEqual(opcoes)
  })
})

describe('hipótese diagnóstica', () => {
  const dx = caso.folhaResposta.diagnostico!

  it('a conduta do M1 só é aceita depois da hipótese', () => {
    const t = revelarTudoDoM1(novaTentativa(caso))
    expect(definirConduta(caso, t, condutaIdeal(t)).passos).toHaveLength(0)
    const comDx = registrarDiagnostico(caso, t, dx.correto, 'brida')
    expect(definirConduta(caso, comDx, condutaIdeal(comDx)).passos).toHaveLength(1)
  })

  it('a hipótese é registrada uma vez e não muda', () => {
    let t = registrarDiagnostico(caso, novaTentativa(caso), dx.incorretos[0], 'gastroenterite')
    t = registrarDiagnostico(caso, t, dx.correto, 'brida')
    expect(t.diagnostico?.classificacao).toBe('incorreto')
  })

  it('pesa 10% da nota: hipótese errada com condutas perfeitas dá 90', () => {
    let t = registrarDiagnostico(caso, revelarTudoDoM1(novaTentativa(caso)), dx.incorretos[0], 'gastroenterite')
    while (!t.desfecho) t = seguir(definirConduta(caso, t, condutaIdeal(t)))
    expect(calcularNota(caso, t.passos, t.diagnostico).final).toBe(90)
    expect(calcularNota(caso, t.passos, { ...t.diagnostico!, classificacao: 'parcial' }).final).toBe(95)
  })
})
