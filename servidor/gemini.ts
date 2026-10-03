// Chamada ao Gemini pela API REST. A chave só existe aqui, no servidor.

export class ErroIA extends Error {}

// Assinatura usada pelas funções: recebe instrução e mensagem, devolve o JSON já lido.
// Nos testes, é trocada por uma IA simulada.
export type ChamarIA = (sistema: string, usuario: string, opcoes?: OpcoesIA) => Promise<unknown>

export interface OpcoesIA {
  tempoLimiteMs?: number
  temperatura?: number
  // Quantas vezes tentar em erro temporário (padrão 2). A extração de caso usa 1: é longa demais para repetir.
  tentativas?: number
  modelo?: string
}

const MODELO_PADRAO = 'gemini-3.8-flash'
const TEMPO_LIMITE_MS = 8000

export const chamarGemini: ChamarIA = async (sistema, usuario, opcoes = {}) => {
  if (process.env.IA_SIMULADA === '1' && !process.env.VERCEL) {
    const { iaSimuladaDoCaso } = await import('./casos.js')
    return iaSimuladaDoCaso(sistema, usuario)
  }
  const chave = process.env.GEMINI_API_KEY
  if (!chave) throw new ErroIA('GEMINI_API_KEY não configurada')
  const modelo = opcoes.modelo || process.env.GEMINI_MODELO || MODELO_PADRAO
  const maxTentativas = opcoes.tentativas ?? 2

  // Uma nova tentativa automática quando o Gemini demora ou dá erro temporário (429, 5xx).
  // Erro de configuração (400, 403) não se repete.
  const limite = opcoes.tempoLimiteMs ?? TEMPO_LIMITE_MS
  let resposta: Response | null = null
  let ultimoErro = ''
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sistema }] },
          contents: [{ role: 'user', parts: [{ text: usuario }] }],
          generationConfig: { temperature: opcoes.temperatura ?? 0.1, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(limite),
      })
    } catch (e) {
      resposta = null
      ultimoErro = `falha de rede ou tempo esgotado (${(e as Error).name})`
    }
    if (resposta?.ok) break
    if (resposta) ultimoErro = `Gemini respondeu ${resposta.status}`
    const temporario = !resposta || resposta.status === 429 || resposta.status >= 500
    console.error(`[ia] tentativa ${tentativa}: ${ultimoErro}`)
    if (!temporario || tentativa === maxTentativas) throw new ErroIA(ultimoErro)
    await new Promise((ok) => setTimeout(ok, 400))
  }
  if (!resposta) throw new ErroIA(ultimoErro)

  const corpo = (await resposta.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  } | null
  const texto = corpo?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  try {
    return JSON.parse(texto)
  } catch {
    throw new ErroIA('Gemini devolveu JSON inválido')
  }
}
