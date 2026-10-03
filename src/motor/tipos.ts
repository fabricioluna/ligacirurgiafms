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

export interface Persona {
  nome: string
  idade: number
  jeito: string
  acompanhante?: string
}

// Hipótese diagnóstica pedida ao aluno antes da conduta do momento indicado.
export interface DiagnosticoFolha {
  momento: string
  correto: string
  parciais: string[]
  incorretos: string[]
  // Percentual da nota final que o diagnóstico vale (o resto vem das condutas).
  peso: number
  raciocinio: string[]
  diferenciais: { diagnostico: string; comoAfastar: string }[]
}

export type ClassificacaoDiagnostico = 'correto' | 'parcial' | 'incorreto'

export interface MomentoFolha {
  codigo: string
  ideal: string[]
  aceitaveis?: string[]
  subotimas?: { conduta: string; custo: string }[]
  errosCriticos: string[]
  pontosDeRaciocinio?: string[]
  justificativa: string[]
  // O que acontece na hora quando o aluno faz a conduta (chave: texto exato do item).
  efeitos?: Record<string, Efeito>
  modoLista?: {
    derivados?: { item: string; quando: Condicao; tambemComoOpcao?: boolean }[]
    rotulos?: Record<string, string>
  }
}

export interface Efeito {
  texto: string
  sinaisVitais?: SinalVital[]
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
    // Quem é o paciente, para a IA falar no jeito dele. Não é informação clínica.
    paciente?: Persona
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
    diagnostico?: DiagnosticoFolha
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
  // Revelada numa conversa com a IA: a fala do paciente fica em Tentativa.conversa.
  viaConversa?: boolean
  em: number
}

// Simulador com IA: o que o aluno disse e o que o paciente respondeu, já conferido pelo servidor.
export interface Fala {
  momento: string
  aluno: string
  paciente: string
  ids: string[]
  // A pergunta não estava no roteiro do caso: a tela avisa.
  foraDoRoteiro?: boolean
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
  conversa?: Fala[]
  // Simulador com IA: ordens já feitas no momento atual, antes de concluí-lo.
  emAndamento?: { momento: string; itens: string[]; textos: string[] }
  diagnostico?: { texto: string; item: string; classificacao: ClassificacaoDiagnostico; em: number }
  aguardandoConfirmacao: boolean
  marcaDesfecho?: string
  desfecho?: string
  // Simulador com IA: comentário do preceptor no relatório, guardado para não chamar a IA de novo.
  comentario?: ComentarioPreceptor
}

export interface ComentarioPreceptor {
  resumo: string
  raciocinio?: string
  pontosFortes: string[]
  pontosACorrigir: string[]
  errosCriticos: string[]
  oQueEstudar: string
}
