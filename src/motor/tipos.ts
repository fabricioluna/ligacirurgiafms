// Tipos que espelham casos/caso-schema.json.

export interface SinalVital {
  rotulo: string
  valor: string
  alterado?: boolean
}

export interface Imagem {
  id: string
  arquivo: string
  legenda?: string
  fonte?: string
  licenca?: string
  // Série de cortes: 'arquivo' termina em '/' e os arquivos são 01.jpg, 02.jpg...
  quantidade?: number
}

export interface ItemAnamnese {
  id: string
  tema: string
  resposta: string
  palavrasChave?: string[]
}

export interface ItemExameFisico {
  id: string
  segmento: string
  achado: string
  palavrasChave?: string[]
}

export interface Exame {
  id: string
  nome: string
  resultado: string
  disponivelAPartirDe?: string
  imagem?: Imagem
  palavrasChave?: string[]
}

export type Acao = 'anamnese' | 'exameFisico' | 'exames' | 'conduta'

export interface Momento {
  codigo: string
  nome: string
  tempo?: string
  situacao: string
  sinaisVitais?: SinalVital[]
  atualizaExames?: { id: string; resultado: string; imagem?: Imagem }[]
  atualizaExameFisico?: { id: string; achado: string }[]
  pergunta: string
  proximo?: string
  acoesDisponiveis?: Acao[]
}

export interface Condicao {
  selecionados?: string[]
  nenhumSelecionado?: string[]
  revelados?: string[]
  naoRevelados?: string[]
}

export interface Regra {
  codigo: string
  momento: string
  se: string
  entao: string
  vaiPara: string
  registrar?: boolean
  disparadaPor?: string[]
  quando?: Condicao
  marcaDesfecho?: string
}

export interface Desfecho {
  codigo: string
  texto: string
  qualidade?: 'otimo' | 'bom' | 'ruim' | 'grave'
}

export interface MomentoFolha {
  codigo: string
  ideal: string[]
  aceitaveis?: string[]
  subotimas?: { conduta: string; custo: string }[]
  errosCriticos: string[]
  pontosDeRaciocinio?: string[]
  justificativa: string[]
  modoLista?: {
    derivados?: { item: string; quando: Condicao; tambemComoOpcao?: boolean }[]
    rotulos?: Record<string, string>
  }
}

export type Classificacao = 'ideal' | 'aceitavel' | 'subotima' | 'perigosa' | 'nao_prevista'

export interface Caso {
  id: string
  versao: string
  publicado?: boolean
  caso: {
    identificacao: {
      titulo: string
      tema: string
      publico?: string
      autor: string
      revisor?: string
      tempoEstimado: string
      referencias?: string[]
    }
    apresentacaoInicial: { texto: string; sinaisVitais: SinalVital[]; pergunta: string }
    anamnese: ItemAnamnese[]
    exameFisico: ItemExameFisico[]
    exames: Exame[]
    respostaPadrao: {
      perguntaNaoListada: string
      laboratorioNaoListado: string
      imagemNaoListada: string
      parecerEspecialista?: string
    }
    momentos: Momento[]
    regras: Regra[]
    desfechos: Desfecho[]
  }
  folhaResposta: {
    objetivos: string[]
    momentos: MomentoFolha[]
    caminhoIdeal: string
    pesos: Record<string, number>
    escala: Record<Exclude<Classificacao, 'nao_prevista'>, number> & { nao_prevista: number | null }
    faixas?: { de: number; ate: number; rotulo: string }[]
    mensagensChave: string[]
    orientacoesFeedback?: string[]
  }
}

// Estado de uma tentativa, salvo no aparelho.

export type TipoDescoberta = 'anamnese' | 'exameFisico' | 'exames'

export interface Descoberta {
  tipo: TipoDescoberta
  // Id do item do caso, ou 'NL-n' quando o pedido não existe no caso (resposta padrão).
  id: string
  momento: string
  titulo: string
  texto: string
  imagem?: Imagem
  // Texto que o aluno escreveu, no simulador com IA.
  pedido?: string
  em: number
}

export type ModoSimulador = 'estatico' | 'ia'

export interface Passo {
  momento: string
  selecionados: string[]
  classificacao: Classificacao
  itemDaFolha: string | null
  errosCriticos: string[]
  subotimas: { conduta: string; custo: string }[]
  faltaram: string[]
  regraAplicada: string | null
  proximo: string
  // Simulador com IA: o texto do aluno.
  textoDoAluno?: string
  em: number
}

// Conduta (ou trecho dela) que não corresponde a nenhum item da folha: registrada para o professor.
export interface NaoPrevista {
  momento: string
  texto: string
  em: number
}

export interface Tentativa {
  id: string
  casoId: string
  versaoCaso: string
  modo: ModoSimulador
  nomeInformado: string
  iniciadaEm: number
  finalizadaEm?: number
  momentoAtual: string
  caminho: string[]
  descobertas: Descoberta[]
  passos: Passo[]
  naoPrevistas: NaoPrevista[]
  aguardandoConfirmacao: boolean
  marcaDesfecho?: string
  desfecho?: string
}
