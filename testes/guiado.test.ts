// Modo guiado: o roteiro só pode apontar para itens que existem na folha resposta do caso.
import { describe, expect, it } from 'vitest'
import c1 from '../casos/caso-001.json'
import c2 from '../casos/caso-002.json'
import c3 from '../casos/caso-003.json'
import type { Caso } from '../src/motor/tipos'
import { desfecho as desfechoDoCaso, ehDesfecho, momento } from '../src/motor/caso'
import { classificarItem, continuar, escolher, examesVisiveis, explicacaoDe, notaGuiada, novoEstado, passoDoRoteiro, rotuloDaOpcao, tambemCertas } from '../src/guiado/motor'
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

      it('toda alternativa tem explicação didática', () => {
        for (const o of p.opcoes) expect(explicacaoDe(caso, p.momento, o.item)?.length ?? 0, o.item).toBeGreaterThan(80)
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

  it('os exames revelados existem e todo exame visível tem resultado de verdade', () => {
    const ids = new Set(caso.caso.exames.map((x) => x.id))
    for (const p of roteiro.passos) {
      for (const id of [...(p.resultados ?? []).map((r) => r.id), ...p.opcoes.flatMap((o) => o.revela ?? [])]) expect(ids.has(id), id).toBe(true)
      for (const r of p.resultados ?? []) if (r.seEscolheu) expect(roteiro.passos.some((x) => x.opcoes.some((o) => o.item === r.seEscolheu)), r.seEscolheu).toBe(true)
    }
    // Em qualquer caminho jogado, nenhum exame visível pode mostrar o texto provisório do caso.
    for (const estrategia of [soIdeais(caso, roteiro), primeiraQueAvanca(caso, roteiro)]) {
      let e = novoEstado(caso, roteiro, '', 1)
      for (let voltas = 0; voltas < 60 && !e.desfecho; voltas++) {
        const p = passoDoRoteiro(roteiro, e.passo)
        for (const item of estrategia(e.passo, p.opcoes.map((o) => o.item))) {
          e = escolher(caso, roteiro, e, item, 1)
          for (const x of examesVisiveis(caso, roteiro, e)) expect(x.exame.resultado, x.exame.id).not.toMatch(/^Disponível apenas/)
          if (e.resposta?.avancou) break
        }
        e = continuar(e, 2)
      }
    }
  })

  it('anastomose no paciente em choque termina em óbito, mesmo depois de uma alta indevida', () => {
    const alta = roteiro.passos[0].opcoes.find((o) => o.marcaDesfecho === 'D4')!
    const ultimo = roteiro.passos.find((p) => p.opcoes.some((o) => o.prevalece))!
    const anastomose = ultimo.opcoes.find((o) => o.prevalece && /anastomose/.test(o.item))!
    const e = jogar(caso, roteiro, (passo, itens) =>
      passo === 'M1' ? [alta.item] : passo === ultimo.momento ? [anastomose.item] : primeiraQueAvanca(caso, roteiro)(passo, itens),
    )
    expect(e.desfecho).toBe(anastomose.vai)
    expect(desfechoDoCaso(caso, e.desfecho!).texto).toMatch(/^Óbito/)
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
    e = escolher(caso, roteiro, e, 'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.', 1)
    expect(notaGuiada(caso, e).final).toBe(50)
    expect(tambemCertas(caso, e, roteiro, 'M1')).toEqual([
      'Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.',
      'Exames: hemograma, eletrólitos, função renal, gasometria, lactato e amilase ou lipase.',
    ])
  })
})

describe('exames no caso 001', () => {
  const caso = c1 as unknown as Caso
  const roteiro = roteiroDoCaso(caso)!
  const contraste = 'Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas.'
  const semContraste = 'Tratamento conservador com reavaliação seriada e prazo definido, sem contraste hidrossolúvel.'
  const ateM3 = (m2: string) => {
    let e = novoEstado(caso, roteiro, '', 1)
    e = continuar(escolher(caso, roteiro, e, 'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.', 1))
    return continuar(escolher(caso, roteiro, e, m2, 1))
  }

  it('a tomografia pedida na admissão aparece no momento seguinte, com a imagem', () => {
    let e = novoEstado(caso, roteiro, '', 1)
    e = continuar(escolher(caso, roteiro, e, 'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.', 1))
    const v = examesVisiveis(caso, roteiro, e)
    expect(v.map((x) => x.exame.id)).toEqual(['EX-12', 'EX-13'])
    expect(v.every((x) => x.novo && x.exame.imagem)).toBe(true)
  })

  it('a radiografia do contraste só aparece para quem deu o contraste, já com o resultado da reavaliação', () => {
    const com = examesVisiveis(caso, roteiro, ateM3(contraste)).find((x) => x.exame.id === 'EX-14')
    expect(com?.exame.resultado).toMatch(/sem chegar ao cólon/)
    expect(com?.exame.imagem?.id).toBe('IMG-001-C')
    expect(examesVisiveis(caso, roteiro, ateM3(semContraste)).some((x) => x.exame.id === 'EX-14')).toBe(false)
  })

  it('a tomografia de controle só aparece para quem pede para repetir a tomografia', () => {
    let e = ateM3(contraste)
    const tc = () => examesVisiveis(caso, roteiro, e).find((x) => x.exame.id === 'EX-13')!
    expect(tc().novo).toBe(false)
    expect(tc().exame.imagem?.id).toBe('IMG-001-B')
    e = escolher(caso, roteiro, e, 'Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia.', 1)
    expect(tc().novo).toBe(true)
    expect(tc().exame.imagem?.id).toBe('IMG-001-D')
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
    // Durante o caso: o abdome na admissão e o achado cirúrgico só quando o texto do momento já descreve a cirurgia.
    expect(ilustracoesDoPasso(caso.id, 'M1').length).toBe(1)
    for (const p of passos.slice(1)) {
      if (ilustracoesDoPasso(caso.id, p).length) expect(momento(caso, p).situacao, p).toMatch(/laparotomia|exploração/i)
    }
  })

  it('o resultado mostra o mecanismo e repete a figura da cirurgia só para quem passou por ela', () => {
    const passos = roteiro.passos.map((p) => p.momento)
    for (const caminho of [passos.filter((p) => !p.endsWith('-ALT')), ['M1', ...passos.filter((p) => p.endsWith('-ALT'))]]) {
      const r = ilustracoesDoResultado(caso.id, caminho)
      expect(r.some((i) => i.onde === 'resultado')).toBe(true)
      for (const i of todasAsIlustracoes(caso.id).filter((x) => x.onde !== 'resultado' && x.onde !== 'M1')) {
        expect(r.includes(i), i.arquivo).toBe(caminho.includes(i.onde))
      }
    }
  })
})
