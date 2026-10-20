// Modo guiado: em cada passo o aluno escolhe uma entre até 6 alternativas e vê na hora o que aconteceu.
// Nenhum texto clínico é escrito aqui: cada alternativa aponta para um item da folha resposta
// (pelo texto exato) e tudo o que aparece vem do caso. Os testes acusam qualquer texto que não bata.

import type { Classificacao } from '../motor/tipos'

export interface OpcaoGuiada {
  // Texto exato de um item da folha resposta do momento.
  item: string
  // Para onde a alternativa leva: outro momento, ou um desfecho (D1, D2...).
  // Sem 'vai', o aluno continua no mesmo passo e escolhe de novo.
  vai?: string
  marcaDesfecho?: string
  // Desfecho que vale mesmo se o caminho já tinha marcado outro (ex.: óbito depois de uma alta indevida).
  prevalece?: boolean
  // Exames (ids EX-) cujo resultado o aluno passa a ver depois de escolher esta alternativa.
  revela?: string[]
}

export interface PassoGuiado {
  momento: string
  // Ordem em que as alternativas aparecem (misturadas de propósito).
  opcoes: OpcaoGuiada[]
  // Exames que chegam sozinhos ao entrar no passo (reavaliação da equipe), com o valor deste momento.
  // 'seEscolheu': só aparece se o aluno escolheu esse item antes (ex.: a radiografia depois do contraste).
  resultados?: { id: string; seEscolheu?: string }[]
}

export interface Roteiro {
  casoId: string
  versaoCaso: string
  passos: PassoGuiado[]
}

export interface Escolha {
  passo: string
  item: string
  classificacao: Classificacao
  em: number
}

// O que o aluno acabou de ver depois de escolher.
export interface Resposta {
  item: string
  classificacao: Classificacao
  consequencia: string | null
  avancou: boolean
  destino?: string
  prevalece?: boolean
}

export interface EstadoGuiado {
  casoId: string
  versaoCaso: string
  nomeInformado: string
  iniciadaEm: number
  passo: string
  caminho: string[]
  escolhas: Escolha[]
  resposta?: Resposta
  marcaDesfecho?: string
  desfecho?: string
  finalizadaEm?: number
}
