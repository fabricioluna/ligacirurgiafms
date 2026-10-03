// Consultas ao caso: o que existe em cada momento, com os valores já atualizados.

import type { Acao, Caso, Efeito, Exame, ItemExameFisico, Momento, MomentoFolha, SinalVital } from './tipos.js'

export const ehDesfecho = (codigo: string) => /^D[0-9]+$/.test(codigo)

export function momento(caso: Caso, codigo: string): Momento {
  const m = caso.caso.momentos.find((x) => x.codigo === codigo)
  if (!m) throw new Error(`Momento ${codigo} não existe no caso ${caso.id}`)
  return m
}

export function momentoFolha(caso: Caso, codigo: string): MomentoFolha {
  const m = caso.folhaResposta.momentos.find((x) => x.codigo === codigo)
  if (!m) throw new Error(`Momento ${codigo} não existe na folha resposta do caso ${caso.id}`)
  return m
}

export function desfecho(caso: Caso, codigo: string) {
  const d = caso.caso.desfechos.find((x) => x.codigo === codigo)
  if (!d) throw new Error(`Desfecho ${codigo} não existe no caso ${caso.id}`)
  return d
}

// Momento ALT usa o peso do momento que substitui.
export const codigoBase = (codigo: string) => codigo.replace(/-ALT$/, '')

export function acoesDisponiveis(m: Momento): Acao[] {
  return m.acoesDisponiveis ?? ['anamnese', 'exameFisico', 'exames', 'conduta']
}

// Efeitos das condutas já feitas no momento, na ordem em que foram feitas.
export function efeitosDe(caso: Caso, codigo: string, itens: string[]): (Efeito & { item: string })[] {
  const f = caso.folhaResposta.momentos.find((m) => m.codigo === codigo)
  return itens.flatMap((item) => (f?.efeitos?.[item] ? [{ item, ...f.efeitos[item] }] : []))
}

// Sinais vitais mais recentes ao longo do caminho, por rótulo; os efeitos das condutas do momento valem por último.
export function sinaisVitaisAtuais(caso: Caso, caminho: string[], efeitos: Efeito[] = []): SinalVital[] {
  const porRotulo = new Map<string, SinalVital>()
  for (const s of caso.caso.apresentacaoInicial.sinaisVitais) porRotulo.set(s.rotulo, { ...s, alterado: s.alterado ?? false })
  for (const cod of caminho) {
    for (const s of momento(caso, cod).sinaisVitais ?? []) porRotulo.set(s.rotulo, { ...s, alterado: s.alterado ?? false })
  }
  for (const e of efeitos) for (const s of e.sinaisVitais ?? []) porRotulo.set(s.rotulo, { ...s, alterado: s.alterado ?? false })
  return [...porRotulo.values()]
}

// Momentos que vêm a partir de um momento, seguindo o caminho esperado.
function cadeiaAPartirDe(caso: Caso, codigo: string): Set<string> {
  const vistos = new Set<string>()
  let atual: string | undefined = codigo
  while (atual && !ehDesfecho(atual) && !vistos.has(atual)) {
    vistos.add(atual)
    atual = momento(caso, atual).proximo
  }
  return vistos
}

export function exameDisponivel(caso: Caso, exame: Exame, momentoAtual: string): boolean {
  if (!exame.disponivelAPartirDe) return true
  return cadeiaAPartirDe(caso, exame.disponivelAPartirDe).has(momentoAtual)
}

// Exames com o resultado atual, aplicando as atualizações dos momentos já percorridos.
export function examesAtuais(caso: Caso, caminho: string[]): Exame[] {
  const exames = caso.caso.exames.map((e) => ({ ...e }))
  for (const cod of caminho) {
    for (const u of momento(caso, cod).atualizaExames ?? []) {
      const e = exames.find((x) => x.id === u.id)
      if (!e) continue
      e.resultado = u.resultado
      if (u.imagem) e.imagem = u.imagem as Exame['imagem']
    }
  }
  return exames
}

export function exameFisicoAtual(caso: Caso, caminho: string[]): ItemExameFisico[] {
  const itens = caso.caso.exameFisico.map((e) => ({ ...e }))
  for (const cod of caminho) {
    for (const u of momento(caso, cod).atualizaExameFisico ?? []) {
      const e = itens.find((x) => x.id === u.id)
      if (e) e.achado = u.achado
    }
  }
  return itens
}

// O tema tem duas partes: "Área geral: diagnóstico". Antes do caso, o aluno só vê a área geral;
// o diagnóstico entregaria a resposta e só aparece no relatório.
export const temaParaAluno = (tema: string) => tema.split(':')[0].trim()
