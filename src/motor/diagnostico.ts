// Hipótese diagnóstica: o aluno registra antes da conduta do momento indicado no caso.
// Correta vale 100%, parcial 50% e incorreta 0% do peso do diagnóstico na nota final.

import type { Caso, ClassificacaoDiagnostico, Tentativa } from './tipos.js'

export const PERCENTUAL_DIAGNOSTICO: Record<ClassificacaoDiagnostico, number> = { correto: 100, parcial: 50, incorreto: 0 }

export const ROTULO_DIAGNOSTICO: Record<ClassificacaoDiagnostico, string> = {
  correto: 'Hipótese correta',
  parcial: 'Hipótese incompleta',
  incorreto: 'Hipótese incorreta',
}

export function classificarDiagnostico(caso: Caso, item: string): ClassificacaoDiagnostico | null {
  const dx = caso.folhaResposta.diagnostico
  if (!dx) return null
  if (item === dx.correto) return 'correto'
  if (dx.parciais.includes(item)) return 'parcial'
  if (dx.incorretos.includes(item)) return 'incorreto'
  return null
}

// Quando o aluno marca mais de uma hipótese (no texto livre), vale a melhor delas:
// listar diferenciais não é erro.
export function melhorDiagnostico(caso: Caso, itens: string[]): string | null {
  const ordem: ClassificacaoDiagnostico[] = ['correto', 'parcial', 'incorreto']
  for (const c of ordem) {
    const achado = itens.find((i) => classificarDiagnostico(caso, i) === c)
    if (achado) return achado
  }
  return null
}

export function todasAsHipoteses(caso: Caso): string[] {
  const dx = caso.folhaResposta.diagnostico
  return dx ? [dx.correto, ...dx.parciais, ...dx.incorretos] : []
}

export const precisaDiagnostico = (caso: Caso, t: Tentativa) =>
  Boolean(caso.folhaResposta.diagnostico && caso.folhaResposta.diagnostico.momento === t.momentoAtual && !t.diagnostico)

// Texto curto da hipótese para mostrar ao aluno: sem a explicação de correção
// (", sem definir a causa"), que entregaria qual opção é a incompleta.
export const rotuloHipotese = (h: string) => {
  const curto = h.split(/,\s+sem\s/)[0].trim()
  return curto.endsWith('.') ? curto : `${curto}.`
}
