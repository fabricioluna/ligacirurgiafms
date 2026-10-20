// Motor do modo guiado. Puro e testado: quem muda o estado é sempre ele.

import { codigoBase, ehDesfecho, examesAtuais, exameFisicoAtual, momento, momentoFolha } from '../motor/caso.js'
import type { Caso, Classificacao, Efeito, Exame, ItemExameFisico } from '../motor/tipos.js'
import type { EstadoGuiado, OpcaoGuiada, PassoGuiado, Resposta, Roteiro } from './tipos.js'

export function passoDoRoteiro(roteiro: Roteiro, momento: string): PassoGuiado {
  const p = roteiro.passos.find((x) => x.momento === momento)
  if (!p) throw new Error(`Passo ${momento} não existe no roteiro`)
  return p
}

export function classificarItem(caso: Caso, momento: string, item: string): Classificacao {
  const f = momentoFolha(caso, momento)
  if (f.ideal.includes(item)) return 'ideal'
  if ((f.aceitaveis ?? []).includes(item)) return 'aceitavel'
  if ((f.subotimas ?? []).some((s) => s.conduta === item)) return 'subotima'
  if (f.errosCriticos.includes(item)) return 'perigosa'
  throw new Error(`Item fora da folha de ${momento}: ${item}`)
}

// Rótulo neutro da folha (modoLista), quando existe, para a alternativa não entregar a resposta pelo jeito de escrever.
export function rotuloDaOpcao(caso: Caso, momento: string, item: string): string {
  return momentoFolha(caso, momento).modoLista?.rotulos?.[item] ?? item
}

export function explicacaoDe(caso: Caso, momento: string, item: string): string | null {
  return momentoFolha(caso, momento).explicacoes?.[item] ?? null
}

export function efeitoDe(caso: Caso, momento: string, item: string): Efeito | undefined {
  return momentoFolha(caso, momento).efeitos?.[item]
}

// A consequência vem sempre do caso: efeito escrito, custo da conduta subótima ou resultado da regra.
export function consequenciaDe(caso: Caso, momento: string, item: string): string | null {
  const efeito = efeitoDe(caso, momento, item)
  const custo = (momentoFolha(caso, momento).subotimas ?? []).find((s) => s.conduta === item)?.custo
  const regra = caso.caso.regras.find((r) => r.momento === momento && r.disparadaPor?.includes(item))
  const partes = [efeito?.texto, custo && `Custo: ${custo}`, regra?.entao].filter((x): x is string => Boolean(x))
  if (partes.length) return partes.join(' ')
  return classificarItem(caso, momento, item) === 'perigosa' ? 'Esta conduta é considerada um erro crítico neste momento.' : null
}

export function novoEstado(caso: Caso, roteiro: Roteiro, nome: string, agora = Date.now()): EstadoGuiado {
  const primeiro = roteiro.passos[0].momento
  return {
    casoId: caso.id,
    versaoCaso: caso.versao,
    nomeInformado: nome.trim().slice(0, 80),
    iniciadaEm: agora,
    passo: primeiro,
    caminho: [primeiro],
    escolhas: [],
  }
}

export const escolhasDoPasso = (e: EstadoGuiado) => e.escolhas.filter((x) => x.passo === e.passo)

export function escolher(caso: Caso, roteiro: Roteiro, e: EstadoGuiado, item: string, agora = Date.now()): EstadoGuiado {
  if (e.desfecho || e.resposta?.avancou) return e
  const opcao: OpcaoGuiada | undefined = passoDoRoteiro(roteiro, e.passo).opcoes.find((o) => o.item === item)
  if (!opcao || escolhasDoPasso(e).some((x) => x.item === item)) return e
  const classificacao = classificarItem(caso, e.passo, item)
  const resposta: Resposta = {
    item,
    classificacao,
    consequencia: consequenciaDe(caso, e.passo, item),
    avancou: opcao.vai !== undefined,
    destino: opcao.vai,
    ...(opcao.prevalece ? { prevalece: true } : {}),
  }
  return {
    ...e,
    escolhas: [...e.escolhas, { passo: e.passo, item, classificacao, em: agora }],
    resposta,
    marcaDesfecho: opcao.marcaDesfecho ?? e.marcaDesfecho,
  }
}

// O aluno leu a resposta e quer seguir: vai para o próximo passo ou termina o caso.
export function continuar(e: EstadoGuiado, agora = Date.now()): EstadoGuiado {
  const destino = e.resposta?.destino
  if (!e.resposta?.avancou || destino === undefined) return { ...e, resposta: undefined }
  if (ehDesfecho(destino)) {
    const final = e.resposta.prevalece ? destino : (e.marcaDesfecho ?? destino)
    return { ...e, resposta: undefined, desfecho: final, finalizadaEm: agora }
  }
  return { ...e, resposta: undefined, passo: destino, caminho: [...e.caminho, destino] }
}

// Efeitos das escolhas já feitas no passo atual, na ordem em que foram feitas.
export function efeitosDoPasso(caso: Caso, e: EstadoGuiado) {
  return escolhasDoPasso(e).flatMap((x) => {
    const ef = efeitoDe(caso, e.passo, x.item)
    return ef ? [{ item: x.item, ...ef }] : []
  })
}

export interface NotaGuiada {
  final: number | null
  faixa: string | null
  porPasso: { passo: string; peso: number; percentual: number }[]
}

// Cada alternativa escolhida conta: o passo vale a média delas. Peso do momento vem da folha; nota só dos passos jogados.
export function notaGuiada(caso: Caso, e: EstadoGuiado): NotaGuiada {
  const { pesos, escala, faixas } = caso.folhaResposta
  const porPasso = e.caminho.flatMap((passo) => {
    const feitas = e.escolhas.filter((x) => x.passo === passo)
    if (!feitas.length) return []
    const soma = feitas.reduce((s, x) => s + (escala[x.classificacao as Exclude<Classificacao, 'nao_prevista'>] ?? 0), 0)
    return [{ passo, peso: pesos[codigoBase(passo)] ?? 0, percentual: soma / feitas.length }]
  })
  const pesoTotal = porPasso.reduce((s, p) => s + p.peso, 0)
  if (!pesoTotal) return { final: null, faixa: null, porPasso }
  const final = Math.round(porPasso.reduce((s, p) => s + p.peso * p.percentual, 0) / pesoTotal)
  const faixa = (faixas ?? []).find((f) => final >= f.de && final <= f.ate)?.rotulo ?? null
  return { final, faixa, porPasso }
}

// Para o relatório: o que também estava certo naquele passo e o aluno não escolheu.
export function tambemCertas(caso: Caso, e: EstadoGuiado, roteiro: Roteiro, passo: string): string[] {
  const feitas = new Set(e.escolhas.filter((x) => x.passo === passo).map((x) => x.item))
  return passoDoRoteiro(roteiro, passo)
    .opcoes.map((o) => o.item)
    .filter((i) => !feitas.has(i) && ['ideal', 'aceitavel'].includes(classificarItem(caso, passo, i)))
}

// Exames que o aluno já viu até aqui. Cada um mostra o resultado do momento em que foi pedido ou trazido
// pela reavaliação: um exame repetido depois (ex.: nova tomografia) só muda se o aluno pedir de novo.
// 'novo': chegou neste passo, pela escolha feita agora, pela reavaliação do passo ou pela decisão que trouxe o aluno até aqui.
export function examesVisiveis(caso: Caso, roteiro: Roteiro, e: EstadoGuiado): { exame: Exame; novo: boolean }[] {
  const escolhidos = new Set(e.escolhas.map((x) => x.item))
  const quando = new Map<string, number>() // id -> índice do passo (no caminho) em que foi visto por último
  const novos = new Set<string>()
  const anterior = e.caminho.length - 2
  e.caminho.forEach((passo, i) => {
    const p = passoDoRoteiro(roteiro, passo)
    const agora = i === e.caminho.length - 1
    const incluir = (id: string, novo: boolean) => {
      quando.delete(id)
      quando.set(id, i)
      if (novo) novos.add(id)
    }
    for (const r of p.resultados ?? []) if (!r.seEscolheu || escolhidos.has(r.seEscolheu)) incluir(r.id, agora)
    for (const x of e.escolhas.filter((y) => y.passo === passo)) {
      const o = p.opcoes.find((y) => y.item === x.item)
      for (const id of o?.revela ?? []) incluir(id, agora || (i === anterior && o?.vai !== undefined))
    }
  })
  return [...quando].flatMap(([id, i]) => {
    const exame = examesAtuais(caso, e.caminho.slice(0, i + 1)).find((x) => x.id === id)
    return exame ? [{ exame, novo: novos.has(id) }] : []
  })
}

// Exames revelados pela última escolha do passo atual (aparecem junto da resposta).
export function examesDaResposta(caso: Caso, roteiro: Roteiro, e: EstadoGuiado): Exame[] {
  if (!e.resposta) return []
  const ids = new Set(passoDoRoteiro(roteiro, e.passo).opcoes.find((o) => o.item === e.resposta!.item)?.revela ?? [])
  return examesVisiveis(caso, roteiro, e).flatMap((x) => (ids.has(x.exame.id) ? [x.exame] : []))
}

// Achados do exame físico que mudaram no momento atual.
export function exameFisicoNovo(caso: Caso, e: EstadoGuiado): ItemExameFisico[] {
  const ids = new Set((momento(caso, e.passo).atualizaExameFisico ?? []).map((u) => u.id))
  return exameFisicoAtual(caso, e.caminho).filter((x) => ids.has(x.id))
}
