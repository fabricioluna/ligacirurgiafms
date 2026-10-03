// Avaliação de uma conduta no modo de lista, por correspondência direta com a folha resposta.
// Nada aqui cria conteúdo: todo texto mostrado ao aluno sai da folha resposta ou das regras do caso.

import { ehDesfecho, momento, momentoFolha } from './caso'
import type { Caso, Classificacao, Condicao, MomentoFolha, Regra } from './tipos'

type Categoria = Exclude<Classificacao, 'nao_prevista'>

export interface Opcao {
  item: string
  rotulo: string
}

// Ordem de gravidade: o item mais grave decide a classificação.
const GRAVIDADE: Record<Categoria, number> = { perigosa: 3, subotima: 2, aceitavel: 1, ideal: 1 }

export function categoriaDoItem(folha: MomentoFolha, item: string): Categoria | null {
  if (folha.errosCriticos.includes(item)) return 'perigosa'
  if ((folha.subotimas ?? []).some((s) => s.conduta === item)) return 'subotima'
  if ((folha.aceitaveis ?? []).includes(item)) return 'aceitavel'
  if (folha.ideal.includes(item)) return 'ideal'
  return null
}

export function todosOsItens(folha: MomentoFolha): string[] {
  return [
    ...folha.ideal,
    ...(folha.aceitaveis ?? []),
    ...(folha.subotimas ?? []).map((s) => s.conduta),
    ...folha.errosCriticos,
  ]
}

export function condicaoVerdadeira(c: Condicao, selecionados: Set<string>, revelados: Set<string>): boolean {
  return (
    (c.selecionados ?? []).every((i) => selecionados.has(i)) &&
    (c.nenhumSelecionado ?? []).every((i) => !selecionados.has(i)) &&
    (c.revelados ?? []).every((i) => revelados.has(i)) &&
    (c.naoRevelados ?? []).every((i) => !revelados.has(i))
  )
}

// Lista de opções do momento, embaralhada de forma estável para a tentativa
// (recarregar a página não muda a ordem).
export function opcoesDoMomento(caso: Caso, codigo: string, semente: string): Opcao[] {
  const folha = momentoFolha(caso, codigo)
  const ocultos = new Set(
    (folha.modoLista?.derivados ?? []).filter((d) => !d.tambemComoOpcao).map((d) => d.item),
  )
  const rotulos = folha.modoLista?.rotulos ?? {}
  const itens = [...new Set(todosOsItens(folha))].filter((i) => !ocultos.has(i))
  return embaralhar(itens, `${semente}:${codigo}`).map((item) => ({ item, rotulo: rotulos[item] ?? item }))
}

export interface ResultadoAvaliacao {
  classificacao: Categoria
  itemDaFolha: string | null
  errosCriticos: string[]
  subotimas: { conduta: string; custo: string }[]
  faltaram: string[]
  regra: Regra | null
  proximo: string
}

// Itens efetivamente considerados: os marcados mais os derivados cuja condição se cumpriu.
export function itensEfetivos(folha: MomentoFolha, selecionados: string[], revelados: Set<string>): Set<string> {
  const marcados = new Set(selecionados)
  const efetivos = new Set(selecionados)
  for (const d of folha.modoLista?.derivados ?? []) {
    if (condicaoVerdadeira(d.quando, marcados, revelados)) efetivos.add(d.item)
  }
  return efetivos
}

export function avaliarConduta(
  caso: Caso,
  codigo: string,
  selecionados: string[],
  revelados: Set<string>,
): ResultadoAvaliacao {
  const folha = momentoFolha(caso, codigo)
  const efetivos = itensEfetivos(folha, selecionados, revelados)

  const errosCriticos = folha.errosCriticos.filter((i) => efetivos.has(i))
  const subotimas = (folha.subotimas ?? []).filter((s) => efetivos.has(s.conduta))
  const faltaram = folha.ideal.filter((i) => !efetivos.has(i))
  const aceitaveis = (folha.aceitaveis ?? []).filter((i) => efetivos.has(i))

  let classificacao: Categoria
  let itemDaFolha: string | null
  if (errosCriticos.length) {
    classificacao = 'perigosa'
    itemDaFolha = errosCriticos[0]
  } else if (subotimas.length) {
    classificacao = 'subotima'
    itemDaFolha = subotimas[0].conduta
  } else if (faltaram.length === 0) {
    classificacao = 'ideal'
    itemDaFolha = folha.ideal[0] ?? null
  } else {
    classificacao = 'aceitavel'
    itemDaFolha = aceitaveis[0] ?? folha.ideal.find((i) => efetivos.has(i)) ?? null
  }

  const regra = regraAplicavel(caso, codigo, folha, efetivos, new Set(selecionados), revelados)
  const proximo = regra ? regra.vaiPara : momento(caso, codigo).proximo
  if (!proximo) throw new Error(`Momento ${codigo} não tem próximo nem regra aplicável`)

  return { classificacao, itemDaFolha, errosCriticos, subotimas, faltaram, regra, proximo }
}

// Entre as regras acionadas, vale a do item mais grave; empate fica com a primeira do caso.
function regraAplicavel(
  caso: Caso,
  codigo: string,
  folha: MomentoFolha,
  efetivos: Set<string>,
  marcados: Set<string>,
  revelados: Set<string>,
): Regra | null {
  let melhor: { regra: Regra; peso: number } | null = null
  for (const regra of caso.caso.regras.filter((r) => r.momento === codigo)) {
    let peso = -1
    for (const item of regra.disparadaPor ?? []) {
      if (!efetivos.has(item)) continue
      const cat = categoriaDoItem(folha, item)
      peso = Math.max(peso, cat ? GRAVIDADE[cat] : 0)
    }
    if (regra.quando && condicaoVerdadeira(regra.quando, marcados, revelados)) peso = Math.max(peso, 0)
    if (peso >= 0 && (!melhor || peso > melhor.peso)) melhor = { regra, peso }
  }
  return melhor?.regra ?? null
}

export const terminaCaso = (proximo: string) => ehDesfecho(proximo)

// Embaralhamento determinístico (mulberry32 sobre um hash da semente).
function embaralhar<T>(lista: T[], semente: string): T[] {
  let h = 1779033703 ^ semente.length
  for (let i = 0; i < semente.length; i++) {
    h = Math.imul(h ^ semente.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  const aleatorio = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
