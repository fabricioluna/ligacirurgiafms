// Ações sobre a tentativa. Funções puras: recebem a tentativa e devolvem uma nova.
// É o app, e não a IA, quem muda o estado do caso.

import { avaliarConduta } from './avaliacao.js'
import { ehDesfecho, exameFisicoAtual, examesAtuais } from './caso.js'
import { classificarDiagnostico, precisaDiagnostico } from './diagnostico.js'
import type { Caso, Descoberta, ModoSimulador, Passo, Tentativa, TipoDescoberta } from './tipos.js'

export function novaTentativa(caso: Caso, nomeInformado = '', modo: ModoSimulador = 'estatico', agora = Date.now()): Tentativa {
  return {
    // Aleatório e impossível de adivinhar: é o que protege a tentativa no banco (sem login).
    id: crypto.randomUUID(),
    casoId: caso.id,
    versaoCaso: caso.versao,
    modo,
    nomeInformado: nomeInformado.trim(),
    iniciadaEm: agora,
    momentoAtual: caso.caso.momentos[0].codigo,
    caminho: [caso.caso.momentos[0].codigo],
    descobertas: [],
    passos: [],
    naoPrevistas: [],
    aguardandoConfirmacao: false,
  }
}

export const idsRevelados = (t: Tentativa) => new Set(t.descobertas.map((d) => d.id))

// Revela uma informação. Repetir o pedido no mesmo momento não duplica o histórico;
// em outro momento o resultado pode ter mudado e entra de novo.
export function revelar(caso: Caso, t: Tentativa, tipo: TipoDescoberta, id: string, agora = Date.now()): Tentativa {
  if (t.aguardandoConfirmacao || t.desfecho) return t
  if (t.descobertas.some((d) => d.id === id && d.momento === t.momentoAtual)) return t

  let d: Descoberta | null = null
  if (tipo === 'anamnese') {
    const a = caso.caso.anamnese.find((x) => x.id === id)
    if (a) d = { tipo, id, momento: t.momentoAtual, titulo: a.tema, texto: a.resposta, em: agora }
  } else if (tipo === 'exameFisico') {
    const e = exameFisicoAtual(caso, t.caminho).find((x) => x.id === id)
    if (e) d = { tipo, id, momento: t.momentoAtual, titulo: e.segmento, texto: e.achado, em: agora }
  } else {
    const e = examesAtuais(caso, t.caminho).find((x) => x.id === id)
    if (e) d = { tipo, id, momento: t.momentoAtual, titulo: e.nome, texto: e.resultado, imagem: e.imagem, em: agora }
  }
  return d ? { ...t, descobertas: [...t.descobertas, d] } : t
}

// Simulador com IA: registra os itens que o aluno pediu, com o texto dele.
// O que aparece é sempre o texto do caso, nunca o da IA.
export function revelarPedido(
  caso: Caso,
  t: Tentativa,
  pedido: string,
  itens: { tipo: TipoDescoberta; id: string }[],
  agora = Date.now(),
): Tentativa {
  let novo = t
  for (const i of itens) novo = revelar(caso, novo, i.tipo, i.id, agora)
  const ultimo = novo.descobertas.at(-1)
  if (novo !== t && ultimo) {
    novo = { ...novo, descobertas: [...novo.descobertas.slice(0, -1), { ...ultimo, pedido }] }
  }
  return novo
}

// Pedido sem correspondência no caso: entra no histórico com a resposta padrão do caso.
export function registrarSemCorrespondencia(
  t: Tentativa,
  tipo: TipoDescoberta,
  pedido: string,
  respostaPadrao: string,
  agora = Date.now(),
): Tentativa {
  if (t.aguardandoConfirmacao || t.desfecho) return t
  const n = t.descobertas.filter((d) => d.id.startsWith('NL-')).length + 1
  const d: Descoberta = { tipo, id: `NL-${n}`, momento: t.momentoAtual, titulo: pedido, texto: respostaPadrao, pedido, em: agora }
  return { ...t, descobertas: [...t.descobertas, d] }
}

export function registrarNaoPrevista(t: Tentativa, texto: string, agora = Date.now()): Tentativa {
  const limpo = texto.trim()
  if (!limpo) return t
  return { ...t, naoPrevistas: [...t.naoPrevistas, { momento: t.momentoAtual, texto: limpo, em: agora }] }
}

// Avalia a conduta e deixa o resultado aguardando o aluno confirmar.
export function definirConduta(
  caso: Caso,
  t: Tentativa,
  selecionados: string[],
  agora = Date.now(),
  textoDoAluno?: string,
): Tentativa {
  if (t.aguardandoConfirmacao || t.desfecho || selecionados.length === 0) return t
  // A hipótese diagnóstica vem antes da conduta do momento indicado no caso.
  if (precisaDiagnostico(caso, t)) return t
  const r = avaliarConduta(caso, t.momentoAtual, selecionados, idsRevelados(t))
  const passo: Passo = {
    momento: t.momentoAtual,
    selecionados,
    classificacao: r.classificacao,
    itemDaFolha: r.itemDaFolha,
    errosCriticos: r.errosCriticos,
    subotimas: r.subotimas,
    faltaram: r.faltaram,
    regraAplicada: r.regra?.codigo ?? null,
    proximo: r.proximo,
    ...(textoDoAluno ? { textoDoAluno } : {}),
    em: agora,
  }
  return {
    ...t,
    passos: [...t.passos, passo],
    aguardandoConfirmacao: true,
    marcaDesfecho: r.regra?.marcaDesfecho ?? t.marcaDesfecho,
  }
}

// O aluno confirmou a avaliação: o caso segue para o próximo momento ou termina.
export function seguir(t: Tentativa, agora = Date.now()): Tentativa {
  if (!t.aguardandoConfirmacao) return t
  const ultimo = t.passos[t.passos.length - 1]
  if (ehDesfecho(ultimo.proximo)) {
    return {
      ...t,
      aguardandoConfirmacao: false,
      desfecho: t.marcaDesfecho ?? ultimo.proximo,
      finalizadaEm: agora,
    }
  }
  return {
    ...t,
    aguardandoConfirmacao: false,
    momentoAtual: ultimo.proximo,
    caminho: [...t.caminho, ultimo.proximo],
  }
}

// Registra a hipótese diagnóstica (uma vez por tentativa).
export function registrarDiagnostico(caso: Caso, t: Tentativa, item: string, texto: string, agora = Date.now()): Tentativa {
  if (t.diagnostico || t.desfecho) return t
  const classificacao = classificarDiagnostico(caso, item)
  if (!classificacao) return t
  return { ...t, diagnostico: { texto: texto.trim() || item, item, classificacao, em: agora } }
}

// Simulador com IA: guarda a troca de falas e revela os itens do caso que ela cobriu.
// O que o paciente disse já foi conferido pelo servidor contra o caso.
export function registrarFala(
  caso: Caso,
  t: Tentativa,
  aluno: string,
  paciente: string,
  itens: { tipo: TipoDescoberta; id: string }[],
  agora = Date.now(),
): Tentativa {
  if (t.aguardandoConfirmacao || t.desfecho) return t
  let novo = t
  for (const i of itens) novo = revelar(caso, novo, i.tipo, i.id, agora)
  const ids = new Set(itens.map((i) => i.id))
  novo = {
    ...novo,
    descobertas: novo.descobertas.map((d) => (d.em === agora && ids.has(d.id) && d.tipo === 'anamnese' ? { ...d, viaConversa: true } : d)),
    conversa: [...(novo.conversa ?? []), { momento: t.momentoAtual, aluno, paciente, ids: [...ids], em: agora }],
  }
  return novo
}
