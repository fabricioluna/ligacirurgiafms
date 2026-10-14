// Modo guiado: o roteiro só pode apontar para itens que existem na folha resposta do caso.
import { describe, expect, it } from 'vitest'
import c1 from '../casos/caso-001.json'
import c2 from '../casos/caso-002.json'
import c3 from '../casos/caso-003.json'
import type { Caso } from '../src/motor/tipos'
import { ehDesfecho } from '../src/motor/caso'
import { classificarItem, continuar, escolher, notaGuiada, novoEstado, passoDoRoteiro, rotuloDaOpcao, tambemCertas } from '../src/guiado/motor'
import { existsSync } from 'node:fs'
import { ilustracoesDoPasso, ilustracoesDoResultado, pastaDeIlustracoes, todasAsIlustracoes } from '../src/guiado/ilustracoes'
import { roteiroDoCaso } from '../src/guiado/roteiros'
import type { EstadoGuiado, Roteiro } from '../src/guiado/tipos'

const casos = [c1, c2, c3].map((c) => c as unknown as Caso)

const avanca = (roteiro: Roteiro, passo: string, item: string) => passoDoRoteiro(roteiro, passo).opcoes.find((o) => o.item === item)?.vai !== undefined

// Joga o caso inteiro; 'escolha' devolve, para cada passo, a fila de alternativas a tentar.
function jogar(caso: Caso, roteiro: Roteiro, escolha: (passo: string, itens: string[]) => string[]): EstadoGuiado {
  let e = novoEstado(caso, roteiro, 'Teste', 1)
  for (let voltas = 0; voltas < 60 && !e.desfecho; voltas++) {
    const p = passoDoRoteiro(roteiro, e.passo)
    for (const item of escolha(e.passo, p.opcoes.map((o) => o.item))) {
      e = escolher(caso, roteiro, e, item, 1)
      if (e.resposta?.avancou) break
    }
    expect(e.resposta?.avancou, `o passo ${e.passo} não avançou`).toBe(true)
    e = continuar(e, 2)
  }
  return e
}

// Só alternativas ideais: as que mantêm o passo primeiro, depois uma que avança.
const soIdeais = (caso: Caso, roteiro: Roteiro) => (passo: string, itens: string[]) => {
  const ideais = itens.filter((i) => classificarItem(caso, passo, i) === 'ideal')
  const avancam = ideais.filter((i) => avanca(roteiro, passo, i))
  return [...ideais.filter((i) => !avancam.includes(i)), avancam[0]]
}

// Uma alternativa ideal que avança (ou, na falta, a primeira que avança).
const primeiraQueAvanca = (caso: Caso, roteiro: Roteiro) => (passo: string, itens: string[]) => {
  const avancam = itens.filter((i) => avanca(roteiro, passo, i))
  return [avancam.find((i) => classificarItem(caso, passo, i) === 'ideal') ?? avancam[0]]
}

describe.each(casos.map((c) => [c.id, c] as const))('roteiro guiado de %s', (_id, caso) => {
  const roteiro = roteiroDoCaso(caso)!

  it('existe e acompanha a versão do caso', () => {
    expect(roteiro).not.toBeNull()
    expect(roteiro.versaoCaso).toBe(caso.versao)
    expect(roteiro.passos[0].momento).toBe(caso.caso.momentos[0].codigo)
  })

  it('tem um passo para cada momento jogável e nenhum a mais', () => {
    const jogaveis = caso.caso.momentos.filter((m) => caso.folhaResposta.momentos.some((f) => f.codigo === m.codigo)).map((m) => m.codigo)
    expect(roteiro.passos.map((p) => p.momento).sort()).toEqual(jogaveis.sort())
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

      it('tem alternativa certa, alternativa com custo e ao menos uma que avança', () => {
        const classes = p.opcoes.map((o) => classificarItem(caso, p.momento, o.item))
        expect(classes.some((c) => c === 'ideal')).toBe(true)
        expect(classes.some((c) => c === 'perigosa' || c === 'subotima')).toBe(true)
        expect(p.opcoes.some((o) => o.vai !== undefined)).toBe(true)
      })

      it('leva a momento ou desfecho que existem e segue as regras do caso', () => {
        for (const o of p.opcoes) {
          if (o.vai !== undefined) {
            expect(ehDesfecho(o.vai) ? caso.caso.desfechos.some((d) => d.codigo === o.vai) : roteiro.passos.some((x) => x.momento === o.vai), o.vai).toBe(true)
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
        const e = { ...novoEstado(caso, roteiro, '', 1), passo: p.momento }
        for (const o of p.opcoes) {
          const c = classificarItem(caso, p.momento, o.item)
          if (c !== 'perigosa' && c !== 'subotima') continue
          expect(escolher(caso, roteiro, e, o.item, 1).resposta?.consequencia, o.item).toBeTruthy()
        }
      })
    })
  }

  it('só com alternativas ideais chega ao desfecho D1 com nota 100', () => {
    const e = jogar(caso, roteiro, soIdeais(caso, roteiro))
    expect(e.desfecho).toBe('D1')
    const n = notaGuiada(caso, e)
    expect(n.final).toBe(100)
    expect(n.faixa).toBe('Excelente')
  })

  it('dar alta na admissão passa pela piora e termina em D4, com nota baixa', () => {
    const alta = roteiro.passos[0].opcoes.find((o) => o.marcaDesfecho === 'D4')!
    const e = jogar(caso, roteiro, (passo, itens) => (passo === 'M1' ? [alta.item] : primeiraQueAvanca(caso, roteiro)(passo, itens)))
    expect(e.caminho[1]).toBe('M3-ALT')
    expect(e.desfecho).toBe('D4')
    expect(notaGuiada(caso, e).final!).toBeLessThan(85)
  })

  it('toda alternativa que avança termina o caso em algum momento (sem laço)', () => {
    // Pior caminho possível: sempre a última alternativa que avança.
    const e = jogar(caso, roteiro, (_p, itens) => [itens.filter((i) => avanca(roteiro, _p, i)).at(-1)!])
    expect(e.desfecho).toBeTruthy()
  })

  it('não muda o estado depois do desfecho', () => {
    const e = jogar(caso, roteiro, primeiraQueAvanca(caso, roteiro))
    expect(escolher(caso, roteiro, e, passoDoRoteiro(roteiro, 'M1').opcoes[0].item, 3)).toBe(e)
  })
})

describe('caminhos específicos do caso 001', () => {
  const caso = c1 as unknown as Caso
  const roteiro = roteiroDoCaso(caso)!

  it('cirurgia imediata sem sofrimento termina em D2', () => {
    const e = jogar(caso, roteiro, (passo, itens) =>
      passo === 'M2' ? ['Indicar cirurgia imediata sem sinais de sofrimento.'] : primeiraQueAvanca(caso, roteiro)(passo, itens),
    )
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

  it('o erro conta na nota do passo e as alternativas certas que sobraram aparecem no relatório', () => {
    let e = novoEstado(caso, roteiro, '', 1)
    e = escolher(caso, roteiro, e, 'Prescrever laxante ou procinético diante de obstrução mecânica.', 1)
    e = escolher(caso, roteiro, e, 'Ir direto para a tomografia sem radiografia prévia.', 1)
    expect(notaGuiada(caso, e).final).toBe(40)
    expect(tambemCertas(caso, e, roteiro, 'M1')).toEqual([
      'Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.',
      'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.',
    ])
  })
})

describe.each(casos.map((c) => [c.id, c] as const))('ilustrações de %s', (_id, caso) => {
  const roteiro = roteiroDoCaso(caso)!

  it('todo arquivo citado existe em public/imagens/casos', () => {
    expect(todasAsIlustracoes(caso.id).length).toBeGreaterThan(0)
    for (const i of todasAsIlustracoes(caso.id)) {
      expect(existsSync('public' + pastaDeIlustracoes(caso.id) + i.arquivo), i.arquivo).toBe(true)
      expect(i.alt.length).toBeGreaterThan(20)
    }
  })

  it('só aparecem passos que existem, e nada que entregue o mecanismo antes do resultado', () => {
    const passos = roteiro.passos.map((p) => p.momento)
    for (const i of todasAsIlustracoes(caso.id)) expect(i.onde === 'resultado' || passos.includes(i.onde), i.arquivo).toBe(true)
    // Durante o caso só aparece o abdome do paciente, na admissão.
    for (const p of passos) expect(ilustracoesDoPasso(caso.id, p).length).toBe(p === 'M1' ? 1 : 0)
  })

  it('o resultado mostra o mecanismo e as figuras de piora só quando o caso piorou', () => {
    const bom = ilustracoesDoResultado(caso.id, ['M1', 'M2', 'M3', 'M4', 'M5'])
    const grave = ilustracoesDoResultado(caso.id, ['M1', 'M3-ALT', 'M4-ALT'])
    expect(bom.length).toBeGreaterThan(0)
    expect(grave.length).toBeGreaterThanOrEqual(bom.length)
  })
})
