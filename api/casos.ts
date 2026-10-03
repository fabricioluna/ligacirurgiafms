import { funcao } from '../servidor/http.js'
import { listarCasosPublicos } from '../servidor/publico.js'

// Lista os casos cadastrados pelo painel e a configuração geral (modo de contingência).
export default funcao(() => listarCasosPublicos())
