// Chamada ao Gemini pela API REST. A chave só existe aqui, no servidor.

export class ErroIA extends Error {}

// Assinatura usada pelas funções: recebe instrução e mensagem, devolve o JSON já lido.
// Nos testes, é trocada por uma IA simulada.
export type ChamarIA = (sistema: string, usuario: string, opcoes?: OpcoesIA) => Promise<unknown>

export interface OpcoesIA {
  tempoLimiteMs?: number
  temperatura?: number
}

const MODELO_PADRAO = 'gemini-3.8-flash'
const TEMPO_LIMITE_MS = 9000

export const chamarGemini: ChamarIA = async (sistema, usuario, opcoes = {}) => {
  if (process.env.IA_SIMULADA === '1' && !process.env.VERCEL) {
    const { iaSimuladaDoCaso } = await import('./casos.js')
    return iaSimuladaDoCaso(sistema, usuario)
  }
  const chave = process.env.GEMINI_API_KEY
  if (!chave) throw new ErroIA('GEMINI_API_KEY não configurada')
  const modelo = process.env.GEMINI_MODELO || MODELO_PADRAO

  let resposta: Response
  try {
    resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: 'user', parts: [{ text: usuario }] }],
        generationConfig: { temperature: opcoes.temperatura ?? 0.1, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(opcoes.tempoLimiteMs ?? TEMPO_LIMITE_MS),
    })
  } catch (e) {
    throw new ErroIA(`Falha ao chamar o Gemini: ${(e as Error).name}`)
  }
  if (!resposta.ok) throw new ErroIA(`Gemini respondeu ${resposta.status}`)

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
