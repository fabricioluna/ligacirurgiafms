// IA simulada, só para desenvolvimento e testes de tela (IA_SIMULADA=1).
// Usa as palavras-chave do caso; não tem nada de inteligente e nunca roda na Vercel sem essa variável.

import type { ChamarIA } from './gemini.js'

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const PALAVRAS_CONDUTA = /prescrev|sonda|operar|cirurg|alta|hidrat|jejum|conservador|antibiot|analges|reposi|contraste|ressec|anastom|laparot|profilax|reavali|internar|soro|dieta/

export function criarIaSimulada(palavrasPorId: Map<string, string[]>): ChamarIA {
  return async (sistema, usuario) => {
    const aluno = normalizar(usuario.match(/<aluno>([\s\S]*)<\/aluno>/)?.[1] ?? '')
    const linhas = usuario.split('\n').map((l) => l.split(' | '))

    if (sistema.includes('relatório final')) {
      return {
        resumo: 'Comentário de teste da IA simulada. Com a chave do Gemini, aqui aparece o comentário do preceptor.',
        pontosFortes: ['Item de teste.'],
        pontosACorrigir: [],
        errosCriticos: [],
        oQueEstudar: 'Revise as mensagens-chave do caso.',
      }
    }

    if (sistema.includes('hipótese diagnóstica')) {
      return { ids: ['H1'] }
    }

    if (sistema.includes('folha resposta')) {
      // Avaliador: item reconhecido quando metade das palavras longas dele aparece no texto do aluno.
      const ids = linhas
        .filter((l) => l.length >= 2 && /^[IASE]\d+$/.test(l[0]))
        .filter(([, texto]) => {
          const palavras = normalizar(texto).match(/[a-z]{6,}/g) ?? []
          const achadas = palavras.filter((p) => aluno.includes(p.slice(0, 6)))
          return palavras.length > 0 && achadas.length / palavras.length >= 0.5
        })
        .map(([id]) => id)
      return { ids, trechosNaoReconhecidos: ids.length ? [] : [aluno.slice(0, 80)] }
    }

    const disponiveis = linhas.filter((l) => l.length >= 2 && /^(AN|EF|EX)-\d+$/.test(l[0])).map((l) => l[0])
    const ids = disponiveis.filter((id) => (palavrasPorId.get(id) ?? []).some((p) => aluno.includes(normalizar(p))))
    const intencao = ids.some((i) => i.startsWith('EX'))
      ? 'pedido_exame'
      : ids.some((i) => i.startsWith('EF'))
        ? 'exame_fisico'
        : ids.length
          ? 'pergunta'
          : PALAVRAS_CONDUTA.test(aluno)
            ? 'conduta'
            : /exame|laborat|dosag|raio|tomo|ultrass|resson/.test(aluno)
              ? 'pedido_exame'
              : 'pergunta'
    const tipoNaoListado = intencao === 'pedido_exame' && !ids.length ? (/raio|tomo|ultrass|resson|imagem/.test(aluno) ? 'imagem' : 'laboratorio') : null
    // Fala: a primeira resposta do caso que corresponde, sem reescrever.
    const resposta = linhas.find((l) => l[0] === ids[0] && l.length >= 3)?.[2] ?? null
    return { intencao, ids, tipoNaoListado, fala: intencao === 'pergunta' ? resposta : null }
  }
}
