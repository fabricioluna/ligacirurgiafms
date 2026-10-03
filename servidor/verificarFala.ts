// Conferência da fala do paciente escrita pela IA, antes de mostrar ao aluno.
// A fala pode reorganizar e reformular, mas não pode trazer fato clínico que não esteja nas fontes
// (respostas do caso que ela cobre, situação atual, quem é o paciente, o que ele já disse).
// Se trouxer número ou termo clínico ausente das fontes, a fala é descartada e vale o texto do caso.

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const palavras = (s: string) => normalizar(s).match(/[a-z]+/g) ?? []

// Cada grupo reúne inícios de palavra que falam do mesmo fato. Uma palavra da fala que caia
// num grupo só é aceita se as fontes tiverem alguma palavra do mesmo grupo.
// Lista conservadora de propósito: na dúvida, vale o texto do caso.
const GRUPOS: string[][] = [
  // sintomas
  ['dor', 'doi', 'doe', 'doend', 'colic', 'pontad', 'aperta', 'queima', 'arde'],
  ['incha', 'estuf', 'distend', 'crescer', 'cresce', 'enchen', 'cheia', 'cheio'],
  ['febr', 'calafri'],
  ['vomit', 'golfa', 'enjo', 'nause'],
  ['sangu', 'sangr'],
  ['diarr', 'solta'],
  ['preso', 'presa', 'constip'],
  ['fez', 'coco', 'evacu', 'banheiro'],
  ['gas', 'gases', 'pum', 'flat'],
  ['urin', 'xix', 'mij'],
  ['tontu', 'desmai'],
  ['tosse', 'catarr'],
  ['peito', 'torax', 'respir', 'folego'],
  ['cansa', 'fraqu'],
  ['emagr', 'peso', 'quilo', 'kilo', 'magr'],
  ['apetit', 'fome'],
  ['amarel', 'esverde', 'verde'],
  ['tremor', 'treme'],
  // evolução: melhora e piora ficam em grupos separados, para a fala não inverter o que aconteceu
  ['melhor', 'aliv', 'diminu', 'cai', 'caiu', 'tranquil', 'passou', 'aliviad'],
  ['pior', 'aument', 'agrav'],
  ['escur', 'preto', 'preta'],
  // corpo
  ['umbig'],
  ['virilh', 'caroc'],
  ['estomag'],
  ['intestin', 'tripa'],
  // doenças e condições
  ['pressao', 'hipert'],
  ['diabet', 'acucar', 'glicos'],
  ['parkins'],
  ['cancer', 'tumor', 'maligno'],
  ['ulcer'],
  ['hernia'],
  ['pedra', 'calcul'],
  ['infec', 'inflam'],
  ['alerg'],
  ['coraca', 'infart'],
  ['derram', 'avc'],
  ['figad', 'vesicul', 'apendic', 'pancrea'],
  ['obstru', 'brida', 'aderen', 'volvo', 'torc', 'entup'],
  ['anem'],
  ['doenc'],
  // remédios e procedimentos
  ['remed', 'comprim', 'medic'],
  ['losart'],
  ['metform'],
  ['levodop'],
  ['laxant'],
  ['insulin'],
  ['dipiron'],
  ['operad', 'operou', 'operar', 'opera', 'cirurg', 'cesar'],
  ['cicatriz', 'corte'],
  ['sonda'],
  ['internad', 'internac'],
  ['exame', 'colonos', 'endosc', 'tomogr', 'raio', 'ultrass', 'ressonan'],
  // hábitos e história familiar
  ['fum', 'cigar'],
  ['bebo', 'bebi', 'bebid', 'alcool', 'cerveja', 'pinga', 'festa'],
  ['pai', 'mae', 'irma', 'famil', 'parente'],
  // tempo de evolução
  ['ontem', 'anteontem'],
  ['semana'],
  ['meses'],
  ['ano', 'anos'],
  ['hora', 'horas'],
]

const grupoDe = (p: string) => GRUPOS.find((g) => g.some((t) => p.startsWith(t)))
const GRUPO_MELHORA = grupoDe('melhorou')

export interface ResultadoFala {
  ok: boolean
  motivo?: string
}

// Negar ou afirmar ter algo que o caso não registra também é inventar ("não sinto isso", "nunca tive").
// Falar do próprio estado ("não tô bem", "não consigo", "não sei") é permitido.
const NEGACAO_DE_FATO =
  /\b(nao|nem)\s+(\w+\s+)?(sinto|senti|sente|sentiu|tenho|tive|tem|teve|uso|usei|tomo|tomei|fumo|fumei|bebo|bebi|reparei|notei|vi|percebi|lembro de ter)\b|\b(nunca|jamais|nenhum|nenhuma|nada disso)\b/

export interface OpcoesFala {
  // A pergunta não tem item no caso: a fala não pode afirmar nem negar fato nenhum.
  semItem?: boolean
}

export function verificarFala(fala: string, fontes: string[], opcoes: OpcoesFala = {}): ResultadoFala {
  const texto = fala.trim()
  if (!texto) return { ok: false, motivo: 'vazia' }
  if (texto.length > 500) return { ok: false, motivo: 'longa demais' }
  const fonte = normalizar(fontes.join(' '))
  const fontePalavras = palavras(fonte)

  for (const n of texto.match(/\d+([.,]\d+)?/g) ?? []) {
    if (!fonte.includes(n)) return { ok: false, motivo: `número ${n} fora das fontes` }
  }
  if (opcoes.semItem && NEGACAO_DE_FATO.test(normalizar(texto))) return { ok: false, motivo: 'nega ou afirma fato que o caso não registra' }
  const lista = palavras(texto)
  for (const [i, p] of lista.entries()) {
    const g = grupoDe(p)
    if (!g) continue
    // "não melhorou" não afirma melhora: só falar de melhora exige que o caso registre melhora.
    if (g === GRUPO_MELHORA && (lista[i - 1] === 'nao' || lista[i - 1] === 'nem')) continue
    if (!fontePalavras.some((f) => g.some((t) => f.startsWith(t)))) return { ok: false, motivo: `"${p}" fora das fontes` }
  }
  return { ok: true }
}
