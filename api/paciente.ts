import { chamarGemini } from '../servidor/gemini.js'
import { funcao } from '../servidor/http.js'
import { processarPaciente } from '../servidor/paciente.js'

export default funcao((corpo) => processarPaciente(corpo, chamarGemini))
