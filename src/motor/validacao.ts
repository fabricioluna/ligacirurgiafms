// Checagens de integridade de um caso, além da estrutura do caso-schema.json.
// Usadas pelos testes e pelo painel do professor antes de publicar um caso.
// Erro impede a publicação; aviso não impede, mas aparece para o professor.

import { categoriaDoItem, todosOsItens } from './avaliacao.js'
import { ehDesfecho } from './caso.js'
import type { Caso, Condicao, MomentoFolha } from './tipos.js'

export interface Validacao {
  erros: string[]
  avisos: string[]
}

export function validarIntegridade(caso: Caso): Validacao {
  const erros: string[] = []
  const avisos: string[] = []
  const c = caso.caso
  const fr = caso.folhaResposta

  const momentos = new Set(c.momentos.map((m) => m.codigo))
  const desfechos = new Set(c.desfechos.map((d) => d.codigo))
  const codigos = new Set([...momentos, ...desfechos])
  const ids = new Set([...c.anamnese.map((a) => a.id), ...c.exameFisico.map((e) => e.id), ...c.exames.map((e) => e.id)])
  const folhaDe = new Map(fr.momentos.map((m) => [m.codigo, m]))

  if (!c.momentos.length) erros.push('O caso não tem nenhum momento.')
  if (!c.desfechos.length) erros.push('O caso não tem nenhum desfecho.')

  // Ids repetidos
  const todosIds = [...c.anamnese, ...c.exameFisico, ...c.exames].map((i) => i.id)
  for (const id of new Set(todosIds.filter((x, i) => todosIds.indexOf(x) !== i))) erros.push(`Id repetido: ${id}.`)

  // Momentos e folha resposta
  for (const m of c.momentos) {
    if (!folhaDe.has(m.codigo)) erros.push(`O momento ${m.codigo} não tem folha resposta.`)
    if (m.proximo && !codigos.has(m.proximo)) erros.push(`O momento ${m.codigo} aponta para ${m.proximo}, que não existe.`)
    if (!m.proximo && !c.regras.some((r) => r.momento === m.codigo)) erros.push(`O momento ${m.codigo} não tem próximo nem regra: o caso trava nele.`)
    const base = m.codigo.replace(/-ALT$/, '')
    if (!(fr.pesos[base] > 0)) erros.push(`O momento ${m.codigo} não tem peso na folha resposta.`)
    for (const u of [...(m.atualizaExames ?? []), ...(m.atualizaExameFisico ?? [])]) {
      if (!ids.has(u.id)) erros.push(`O momento ${m.codigo} atualiza ${u.id}, que não existe.`)
    }
  }
  for (const f of fr.momentos) if (!momentos.has(f.codigo)) erros.push(`A folha resposta tem o momento ${f.codigo}, que não existe no caso.`)

  const soma = Object.values(fr.pesos).reduce((a, b) => a + b, 0)
  if (soma !== 100) erros.push(`Os pesos somam ${soma}, e deveriam somar 100.`)

  for (const f of fr.momentos) {
    if (!f.ideal.length) erros.push(`O momento ${f.codigo} não tem nenhuma conduta ideal.`)
    const itens = todosOsItens(f)
    for (const i of new Set(itens.filter((x, n) => itens.indexOf(x) !== n))) erros.push(`No momento ${f.codigo}, o item "${i}" aparece em duas categorias.`)
  }

  const conferirCondicao = (onde: string, f: MomentoFolha | undefined, q: Condicao) => {
    for (const item of [...(q.selecionados ?? []), ...(q.nenhumSelecionado ?? [])]) {
      if (!f || !categoriaDoItem(f, item)) erros.push(`${onde}: o item "${item}" não existe na folha resposta.`)
    }
    for (const id of [...(q.revelados ?? []), ...(q.naoRevelados ?? [])]) if (!ids.has(id)) erros.push(`${onde}: ${id} não existe no caso.`)
  }

  // Regras
  for (const r of c.regras) {
    const onde = `Regra ${r.codigo}`
    if (!momentos.has(r.momento)) erros.push(`${onde}: o momento ${r.momento} não existe.`)
    if (!codigos.has(r.vaiPara)) erros.push(`${onde}: vai para ${r.vaiPara}, que não existe.`)
    if (r.marcaDesfecho && !(ehDesfecho(r.marcaDesfecho) && desfechos.has(r.marcaDesfecho))) erros.push(`${onde}: o desfecho ${r.marcaDesfecho} não existe.`)
    if (!r.disparadaPor?.length && !r.quando) avisos.push(`${onde}: não diz qual conduta a aciona, então nunca será aplicada.`)
    const f = folhaDe.get(r.momento)
    for (const item of r.disparadaPor ?? []) if (!f || !categoriaDoItem(f, item)) erros.push(`${onde}: o item "${item}" não existe na folha resposta do ${r.momento}.`)
    if (r.quando) conferirCondicao(onde, f, r.quando)
  }

  // Modo de lista
  for (const f of fr.momentos) {
    for (const d of f.modoLista?.derivados ?? []) {
      if (!categoriaDoItem(f, d.item)) erros.push(`Modo de lista do ${f.codigo}: o item "${d.item}" não existe na folha resposta.`)
      conferirCondicao(`Modo de lista do ${f.codigo}`, f, d.quando)
    }
    for (const item of Object.keys(f.modoLista?.rotulos ?? {})) {
      if (!categoriaDoItem(f, item)) erros.push(`Rótulo do ${f.codigo}: o item "${item}" não existe na folha resposta.`)
    }
    const omissoes = [...f.errosCriticos, ...(f.subotimas ?? []).map((s) => s.conduta)].filter((t) => /^(não|negar|ignorar)\b/i.test(t))
    const derivados = new Set((f.modoLista?.derivados ?? []).map((d) => d.item))
    const soltas = omissoes.filter((o) => !derivados.has(o))
    if (soltas.length) avisos.push(`No ${f.codigo}, ${soltas.length} item(ns) de omissão aparecem como opção na lista do simulador estático (ex.: "${soltas[0]}").`)
  }

  // Alcance: todo momento e desfecho precisa poder ser alcançado
  if (c.momentos.length) {
    const alcancaveis = new Set([c.momentos[0].codigo])
    let mudou = true
    while (mudou) {
      mudou = false
      for (const cod of [...alcancaveis]) {
        const m = c.momentos.find((x) => x.codigo === cod)
        const destinos = [m?.proximo, ...c.regras.filter((r) => r.momento === cod).flatMap((r) => [r.vaiPara, r.marcaDesfecho])]
        for (const d of destinos) {
          if (d && codigos.has(d) && !alcancaveis.has(d)) {
            alcancaveis.add(d)
            mudou = true
          }
        }
      }
    }
    for (const cod of codigos) if (!alcancaveis.has(cod)) avisos.push(`${cod} nunca é alcançado por nenhum caminho.`)
  }

  // Imagens e créditos
  for (const e of c.exames) {
    const imgs = [e.imagem, ...c.momentos.flatMap((m) => (m.atualizaExames ?? []).filter((u) => u.id === e.id).map((u) => u.imagem))]
    for (const img of imgs) {
      if (!img) continue
      if (!img.fonte || /a definir/i.test(img.fonte) || !img.licenca || /a definir/i.test(img.licenca)) {
        avisos.push(`A imagem ${img.id ?? e.id} está sem fonte ou licença definida.`)
      }
    }
  }

  if (!c.identificacao.tema.includes(':')) {
    avisos.push('O tema não está no formato "Área geral: diagnóstico". Antes do caso o aluno vê o tema inteiro, o que pode entregar o diagnóstico.')
  }
  if (!fr.mensagensChave.length) avisos.push('A folha resposta não tem mensagens-chave.')
  if (!(c.identificacao.referencias ?? []).length) avisos.push('O caso não tem referências.')

  return { erros, avisos }
}
