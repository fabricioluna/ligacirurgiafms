import { processarAvaliar } from '../servidor/avaliar.js'
import { chamarGemini } from '../servidor/gemini.js'
import { funcao } from '../servidor/http.js'

export default funcao((corpo) => processarAvaliar(corpo, chamarGemini))
