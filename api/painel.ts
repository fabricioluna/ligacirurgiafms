import { chamarGemini } from '../servidor/gemini.js'
import { funcao } from '../servidor/http.js'
import { processarPainel } from '../servidor/painel.js'

// Pedido maior: o cadastro de caso leva o texto de dois PDFs.
export default funcao((corpo, ctx) => processarPainel(corpo, ctx, chamarGemini), 400_000)
