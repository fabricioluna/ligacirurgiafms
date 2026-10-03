// Cadastro de caso pelo painel: a IA transforma o texto dos dois PDFs (caso e folha resposta)
// no formato do app. Ela copia, não cria: o que não estiver nos documentos vira pendência.
// O resultado é sempre um rascunho, validado e jogável em prévia antes de qualquer publicação.

import schema from '../casos/caso-schema.json' with { type: 'json' }
import exemplo from '../casos/caso-001.json' with { type: 'json' }
import type { ChamarIA } from './gemini.js'
import { ErroIA } from './gemini.js'
import { ErroPedido } from './http.js'
import { validarCaso } from './validarCaso.js'
import type { Validacao } from '../src/motor/validacao.js'

export const TEXTO_MAXIMO_PDF = 150_000

export const SISTEMA_EXTRACAO = `Você converte os documentos de um caso clínico, escritos por um professor de cirurgia, para o formato JSON de um simulador de ensino.

Você recebe dois textos extraídos de PDF: o CASO (o que existe para ser descoberto: apresentação, anamnese, exame físico, exames, momentos, regras de evolução e desfechos) e a FOLHA RESPOSTA (o que se espera do aluno em cada momento, pesos, mensagens-chave).

Regra absoluta: você copia, não cria. Todo texto clínico do JSON precisa estar escrito nos documentos. Não complete lacunas com o seu conhecimento médico, não invente valor de exame, achado, conduta, regra, desfecho ou referência. Se uma informação obrigatória não estiver nos documentos, deixe o campo com texto vazio ("") ou a lista vazia e registre o que faltou em "pendencias".

Como montar:
- Siga exatamente o schema JSON fornecido e use o caso de exemplo como modelo de estrutura e de estilo.
- Ids: anamnese AN-01, AN-02...; exame físico EF-01...; exames EX-01...; imagens IMG-<número do caso>-A, -B...; momentos M1, M2... e M2-ALT para caminhos alternativos; desfechos D1, D2...; regras R1, R2...
- Respostas da anamnese ficam na voz do paciente, exatamente como no documento. Se o documento trouxer só o dado clínico, sem a fala, copie o dado e registre a pendência "fala do paciente ausente em AN-xx".
- palavrasChave: termos e sinônimos que um aluno usaria para pedir aquele item. É o único campo em que você pode escrever por conta própria, porque não é informação clínica.
- Itens da folha resposta (ideal, aceitaveis, subotimas, errosCriticos) são copiados como frases completas.
- Nas regras, preencha "disparadaPor" com o texto EXATO dos itens da folha resposta daquele momento que acionam a regra. Se nenhum item corresponder, deixe "disparadaPor" vazio e registre a pendência.
- Não crie o campo "modoLista".
- Pesos: copie do documento. Se não existirem, deixe {} e registre a pendência.
- Imagens: crie o objeto "imagem" quando o documento citar uma imagem, com "arquivo" no padrão img-<número>-<letra>.jpg, e "fonte" e "licenca" copiados do documento, ou "A definir" se não houver.
- "publicado" é sempre false.

Responda apenas com JSON neste formato:
{"caso": { ...o caso completo... }, "pendencias": ["o que faltou nos documentos, uma frase por item"]}`

export interface ResultadoExtracao {
  caso: unknown
  pendencias: string[]
  validacao: Validacao
}

export function mensagemExtracao(textoCaso: string, textoFolha: string, id: string) {
  return [
    `O caso novo recebe o id ${id}.`,
    '',
    'SCHEMA JSON:',
    JSON.stringify(schema),
    '',
    'CASO DE EXEMPLO (só como modelo de estrutura; não copie o conteúdo clínico dele):',
    JSON.stringify(exemplo),
    '',
    '<documento-caso>',
    textoCaso,
    '</documento-caso>',
    '',
    '<documento-folha-resposta>',
    textoFolha,
    '</documento-folha-resposta>',
  ].join('\n')
}

export async function extrairCaso(textoCaso: unknown, textoFolha: unknown, id: string, ia: ChamarIA): Promise<ResultadoExtracao> {
  for (const t of [textoCaso, textoFolha]) {
    if (typeof t !== 'string' || t.trim().length < 200) throw new ErroPedido('O texto de um dos PDFs veio vazio. Confira se o PDF tem texto (e não só imagem escaneada).')
    if (t.length > TEXTO_MAXIMO_PDF) throw new ErroPedido('Um dos PDFs é grande demais.')
  }
  const bruto = (await ia(SISTEMA_EXTRACAO, mensagemExtracao(textoCaso as string, textoFolha as string, id), {
    tempoLimiteMs: 240_000,
    temperatura: 0,
    tentativas: 1,
    modelo: process.env.GEMINI_MODELO_EXTRACAO,
  })) as { caso?: Record<string, unknown>; pendencias?: unknown }
  if (!bruto || typeof bruto !== 'object' || !bruto.caso || typeof bruto.caso !== 'object') throw new ErroIA('Extração fora do formato')
  const caso = { ...bruto.caso, id, publicado: false }
  const pendencias = Array.isArray(bruto.pendencias) ? bruto.pendencias.filter((p): p is string => typeof p === 'string').slice(0, 60) : []
  return { caso, pendencias, validacao: validarCaso(caso) }
}
