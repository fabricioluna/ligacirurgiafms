import { processarFeedback } from '../servidor/feedback.js'
import { chamarGemini } from '../servidor/gemini.js'
import { funcao } from '../servidor/http.js'

// Pedido maior: leva os itens da folha escolhidos em cada momento.
export default funcao((corpo) => processarFeedback(corpo, chamarGemini), 40_000)
