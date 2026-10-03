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
  ['pior'],
  ['aliv'],
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

export interface ResultadoFala {
  ok: boolean
  motivo?: string
}

export function verificarFala(fala: string, fontes: string[]): ResultadoFala {
  const texto = fala.trim()
  if (!texto) return { ok: false, motivo: 'vazia' }
  if (texto.length > 500) return { ok: false, motivo: 'longa demais' }
  const fonte = normalizar(fontes.join(' '))
  const fontePalavras = palavras(fonte)

  for (const n of texto.match(/\d+([.,]\d+)?/g) ?? []) {
    if (!fonte.includes(n)) return { ok: false, motivo: `número ${n} fora das fontes` }
  }
  for (const p of palavras(texto)) {
    const g = grupoDe(p)
    if (g && !fontePalavras.some((f) => g.some((t) => f.startsWith(t)))) return { ok: false, motivo: `"${p}" fora das fontes` }
  }
  return { ok: true }
}
