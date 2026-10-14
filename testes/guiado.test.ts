// Modo guiado: o roteiro só pode apontar para itens que existem na folha resposta do caso.
import { describe, expect, it } from 'vitest'
import c1 from '../casos/caso-001.json'
import type { Caso } from '../src/motor/tipos'
import { ehDesfecho } from '../src/motor/caso'
import { classificarItem, continuar, escolher, notaGuiada, novoEstado, passoDoRoteiro, rotuloDaOpcao, tambemCertas } from '../src/guiado/motor'
import { roteiroDoCaso } from '../src/guiado/roteiros'
import type { EstadoGuiado } from '../src/guiado/tipos'

const caso = c1 as unknown as Caso
const roteiro = roteiroDoCaso(caso)!

// Joga um passo escolhendo, na ordem de preferência, só alternativas das classes pedidas.
function jogar(escolha: (passo: string, itens: string[]) => string[]): EstadoGuiado {
  let e = novoEstado(caso, roteiro, 'Teste', 1)
  for (let voltas = 0; voltas < 60 && !e.desfecho; voltas++) {
    const p = passoDoRoteiro(roteiro, e.passo)
    const fila = escolha(e.passo, p.opcoes.map((o) => o.item))
    for (const item of fila) {
      e = escolher(caso, roteiro, e, item, 1)
      if (e.resposta?.avancou) break
    }
    expect(e.resposta?.avancou, `o passo ${e.passo} não avançou`).toBe(true)
    e = continuar(e, 2)
  }
  return e
}

describe('roteiro do caso 001', () => {
  it('existe e acompanha a versão do caso', () => {
    expect(roteiro.versaoCaso).toBe(caso.versao)
  })

  for (const p of roteiro.passos) {
    describe(`passo ${p.momento}`, () => {
      it('tem de 4 a 6 alternativas, todas da folha resposta, sem repetir', () => {
        expect(p.opcoes.length).toBeGreaterThanOrEqual(4)
        expect(p.opcoes.length).toBeLessThanOrEqual(6)
        expect(new Set(p.opcoes.map((o) => o.item)).size).toBe(p.opcoes.length)
        expect(new Set(p.opcoes.map((o) => rotuloDaOpcao(caso, p.momento, o.item))).size).toBe(p.opcoes.length)
        for (const o of p.opcoes) expect(() => classificarItem(caso, p.momento, o.item)).not.toThrow()
      })

      it('tem alternativa certa, alternativa errada e ao menos uma que avança', () => {
        const classes = p.opcoes.map((o) => classificarItem(caso, p.momento, o.item))
        expect(classes.some((c) => c === 'ideal')).toBe(true)
        expect(classes.some((c) => c === 'perigosa' || c === 'subotima')).toBe(true)
        expect(p.opcoes.some((o) => o.vai !== undefined)).toBe(true)
      })

      it('leva a momento ou desfecho que existem e segue as regras do caso', () => {
        for (const o of p.opcoes) {
          if (o.vai !== undefined) {
            expect(ehDesfecho(o.vai) ? caso.caso.desfechos.some((d) => d.codigo === o.vai) : caso.caso.momentos.some((m) => m.codigo === o.vai)).toBe(true)
          }
          const regra = caso.caso.regras.find((r) => r.momento === p.momento && r.disparadaPor?.includes(o.item))
          if (regra) {
            expect(o.vai, `regra ${regra.codigo}`).toBe(regra.vaiPara)
            expect(o.marcaDesfecho, `regra ${regra.codigo}`).toBe(regra.marcaDesfecho)
          } else {
            expect(o.marcaDesfecho).toBeUndefined()
          }
        }
      })

      it('o erro crítico ou a conduta subótima sempre mostra uma consequência', () => {
        let e = novoEstado(caso, roteiro, '', 1)
        e = { ...e, passo: p.momento }
        for (const o of p.opcoes) {
          const c = classificarItem(caso, p.momento, o.item)
          if (c !== 'perigosa' && c !== 'subotima') continue
          const depois = escolher(caso, roteiro, e, o.item, 1)
          expect(depois.resposta?.consequencia, o.item).toBeTruthy()
        }
      })
    })
  }
})

describe('percurso do caso 001 no modo guiado', () => {
  it('só com alternativas ideais chega ao desfecho D1 com nota excelente', () => {
    const e = jogar((passo, itens) => {
      const ideais = itens.filter((i) => classificarItem(caso, passo, i) === 'ideal')
      const avancam = ideais.filter((i) => passoDoRoteiro(roteiro, passo).opcoes.find((o) => o.item === i)?.vai !== undefined)
      // ideais que só mantêm o passo vêm antes, e então uma que avança
      return [...ideais.filter((i) => !avancam.includes(i)), avancam[0]]
    })
    expect(e.desfecho).toBe('D1')
    const n = notaGuiada(caso, e)
    expect(n.final).toBe(100)
    expect(n.faixa).toBe('Excelente')
  })

  it('dar alta já na admissão leva ao desfecho D4 passando pelo choque', () => {
    const e = jogar((passo, itens) => {
      if (passo === 'M1') return ['Dar alta ou tratar como gastroenterite sem investigar a obstrução.']
      const ideal = itens.find((i) => classificarItem(caso, passo, i) === 'ideal' && passoDoRoteiro(roteiro, passo).opcoes.find((o) => o.item === i)?.vai)
      return [ideal!]
    })
    expect(e.caminho).toEqual(['M1', 'M3-ALT', 'M4-ALT'])
    expect(e.desfecho).toBe('D4')
    expect(notaGuiada(caso, e).final!).toBeLessThan(85)
  })

  it('cirurgia imediata sem sofrimento termina em D2', () => {
    const e = jogar((passo, itens) => {
      if (passo === 'M2') return ['Indicar cirurgia imediata sem sinais de sofrimento.']
      const ideal = itens.find((i) => classificarItem(caso, passo, i) === 'ideal' && passoDoRoteiro(roteiro, passo).opcoes.find((o) => o.item === i)?.vai)
      return [ideal!]
    })
    expect(e.desfecho).toBe('D2')
  })

  it('escolha que não avança deixa o aluno no passo e não pode ser repetida', () => {
    let e = novoEstado(caso, roteiro, '', 1)
    const laxante = 'Prescrever laxante ou procinético diante de obstrução mecânica.'
    e = escolher(caso, roteiro, e, laxante, 1)
    expect(e.resposta?.avancou).toBe(false)
    expect(e.resposta?.classificacao).toBe('perigosa')
    expect(e.resposta?.consequencia).toMatch(/vomita/)
    expect(escolher(caso, roteiro, e, laxante, 1).escolhas).toHaveLength(1)
    expect(continuar(e).passo).toBe('M1')
  })

  it('o erro conta na nota do passo e a alternativa certa que sobrou aparece no relatório', () => {
    let e = novoEstado(caso, roteiro, '', 1)
    e = escolher(caso, roteiro, e, 'Prescrever laxante ou procinético diante de obstrução mecânica.', 1)
    e = escolher(caso, roteiro, e, 'Ir direto para a tomografia sem radiografia prévia.', 1)
    expect(notaGuiada(caso, e).final).toBe(40)
    expect(tambemCertas(caso, e, roteiro, 'M1')).toEqual([
      'Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.',
      'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.',
    ])
  })

  it('não muda o estado depois do desfecho', () => {
    const e = jogar((passo, itens) => [itens.find((i) => classificarItem(caso, passo, i) === 'ideal' && passoDoRoteiro(roteiro, passo).opcoes.find((o) => o.item === i)?.vai)!])
    expect(escolher(caso, roteiro, e, passoDoRoteiro(roteiro, 'M1').opcoes[0].item, 3)).toBe(e)
  })
})
