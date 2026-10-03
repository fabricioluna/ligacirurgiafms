// Gera os documentos dos casos a partir dos arquivos do simulador (casos/caso-NNN.json):
//   docs/casos/CASO-NNN.md       caso, folha resposta, imagens necessárias e decisões pendentes
//   docs/casos/README.md         índice dos casos
//   docs/IMAGENS-PENDENTES.md    todas as imagens que faltam
// Uso: npm run documentos. Não edite os arquivos gerados à mão: edite o caso e gere de novo.
// As decisões pendentes ficam em docs/casos/pendencias.json (esse sim, editado à mão).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const casos = readdirSync('casos')
  .filter((f) => /^caso-\d{3}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join('casos', f), 'utf8')))
const pendencias = JSON.parse(readFileSync('docs/casos/pendencias.json', 'utf8'))
mkdirSync('docs/casos', { recursive: true })

const AVISO = '<!-- Arquivo gerado por `npm run documentos` a partir de casos/*.json. Não edite à mão. -->'
const cel = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const tabela = (cab, linhas) => [`| ${cab.join(' | ')} |`, `| ${cab.map(() => '---').join(' | ')} |`, ...linhas.map((l) => `| ${l.map(cel).join(' | ')} |`)].join('\n')
const lista = (itens) => itens.map((i) => `- ${i}`).join('\n')
const QUALIDADE = { otimo: 'ótimo', bom: 'bom', ruim: 'ruim', grave: 'grave' }
const ACAO = { anamnese: 'perguntar', exameFisico: 'examinar', exames: 'pedir exame', conduta: 'conduta' }

function nomeDoCodigo(caso, cod) {
  const m = caso.caso.momentos.find((x) => x.codigo === cod)
  if (m) return `${cod} (${m.nome})`
  const d = caso.caso.desfechos.find((x) => x.codigo === cod)
  return d ? `${cod} (desfecho ${QUALIDADE[d.qualidade] ?? ''})` : cod
}

function descreverCondicao(caso, q) {
  const nomeId = (id) => {
    const i = [...caso.caso.anamnese, ...caso.caso.exameFisico, ...caso.caso.exames].find((x) => x.id === id)
    return i ? `${id} (${i.tema ?? i.segmento ?? i.nome})` : id
  }
  const partes = []
  if (q.revelados?.length) partes.push(`o aluno descobriu ${q.revelados.map(nomeId).join(', ')}`)
  if (q.naoRevelados?.length) partes.push(`o aluno não descobriu ${q.naoRevelados.map(nomeId).join(', ')}`)
  if (q.selecionados?.length) partes.push(`marcou ${q.selecionados.map((s) => `"${s}"`).join(' e ')}`)
  if (q.nenhumSelecionado?.length) partes.push(`não marcou ${q.nenhumSelecionado.map((s) => `"${s}"`).join(' nem ')}`)
  return partes.join('; ')
}

function imagensDoCaso(caso) {
  const lista = []
  const arquivos = (img) =>
    img.arquivo.endsWith('/')
      ? img.quantidade
        ? Array.from({ length: img.quantidade }, (_, i) => `${img.arquivo}${String(i + 1).padStart(2, '0')}.jpg`)
        : [`${img.arquivo}01.jpg, 02.jpg, ... (série; informar a quantidade)`]
      : [img.arquivo]
  for (const e of caso.caso.exames) {
    if (!e.imagem) continue
    const disponivel = e.disponivelAPartirDe ? `a partir do ${e.disponivelAPartirDe}` : 'em qualquer momento'
    const atualizacao = caso.caso.momentos.flatMap((m) => (m.atualizaExames ?? []).filter((u) => u.id === e.id && !u.imagem).map((u) => ({ m, u })))
    const resultado = atualizacao.length && /disponível apenas/i.test(e.resultado) ? atualizacao[0].u.resultado : e.resultado
    lista.push({ img: e.imagem, exame: `${e.id} ${e.nome}`, quando: `Quando o aluno pede o exame, ${disponivel}`, mostra: resultado, arquivos: arquivos(e.imagem) })
  }
  for (const m of caso.caso.momentos) {
    for (const u of m.atualizaExames ?? []) {
      if (!u.imagem) continue
      const e = caso.caso.exames.find((x) => x.id === u.id)
      lista.push({ img: u.imagem, exame: `${u.id} ${e?.nome ?? ''} (atualizado)`, quando: `Quando o aluno repete o exame no ${m.codigo} (${m.nome})`, mostra: u.resultado, arquivos: arquivos(u.imagem) })
    }
  }
  return lista.map((x) => ({ ...x, existe: x.arquivos.every((a) => existsSync(join('public', 'imagens', 'casos', caso.id.toLowerCase(), a))) }))
}

function documento(caso) {
  const c = caso.caso
  const fr = caso.folhaResposta
  const id = c.identificacao
  const L = [AVISO, '', `# ${caso.id}: ${id.titulo}`, '']
  L.push(
    tabela(['', ''], [
      ['Tema', id.tema],
      ['Público', id.publico ?? ''],
      ['Tempo estimado', id.tempoEstimado],
      ['Autor', id.autor],
      ['Versão', caso.versao],
      ['Situação', 'Conteúdo clínico aguardando validação (ver "Decisões pendentes" no fim)'],
    ]),
    '',
    '## Resumo',
    '',
    fr.caminhoIdeal,
    '',
    '**Objetivos de aprendizagem**',
    '',
    lista(fr.objetivos),
    '',
    '# Parte 1: o caso',
    '',
    'Tudo o que o aluno pode descobrir. O simulador mostra estes textos exatamente como estão aqui; a IA nunca escreve informação clínica.',
    '',
    '## Apresentação inicial',
    '',
    c.apresentacaoInicial.texto,
    '',
    tabela(['Sinal vital', 'Valor'], c.apresentacaoInicial.sinaisVitais.map((s) => [s.rotulo, `${s.valor}${s.alterado ? ' (alterado)' : ''}`])),
    '',
    `**Pergunta ao aluno:** ${c.apresentacaoInicial.pergunta}`,
    '',
    '## Anamnese',
    '',
    'Respostas na voz do paciente.',
    '',
    tabela(['Id', 'Tema', 'Resposta do paciente'], c.anamnese.map((a) => [a.id, a.tema, a.resposta])),
    '',
    '## Exame físico',
    '',
    tabela(['Id', 'Segmento', 'Achado'], c.exameFisico.map((e) => [e.id, e.segmento, e.achado])),
    '',
    '## Exames complementares',
    '',
    tabela(['Id', 'Exame', 'Resultado', 'Disponível', 'Imagem'], c.exames.map((e) => [e.id, e.nome, e.resultado, e.disponivelAPartirDe ? `a partir do ${e.disponivelAPartirDe}` : 'sempre', e.imagem ? e.imagem.id : ''])),
    '',
    '## Respostas padrão',
    '',
    'O que o simulador responde quando o aluno pede algo que não existe no caso.',
    '',
    tabela(['Situação', 'Resposta'], [
      ['Pergunta que não está no caso', c.respostaPadrao.perguntaNaoListada],
      ['Exame de laboratório que não está no caso', c.respostaPadrao.laboratorioNaoListado],
      ['Exame de imagem que não está no caso', c.respostaPadrao.imagemNaoListada],
      ['Segmento do exame físico que não está no caso', c.respostaPadrao.exameFisicoNaoListado ?? '(padrão do sistema)'],
      ['Pedido de parecer de especialista', c.respostaPadrao.parecerEspecialista ?? ''],
    ]),
    '',
    '## Momentos',
    '',
  )
  for (const m of c.momentos) {
    L.push(`### ${m.codigo}: ${m.nome}`, '')
    if (m.tempo) L.push(`*${m.tempo}*`, '')
    L.push(m.codigo === c.momentos[0].codigo ? 'Situação: a apresentação inicial.' : m.situacao, '')
    if (m.sinaisVitais?.length) L.push(tabela(['Sinal vital', 'Valor'], m.sinaisVitais.map((s) => [s.rotulo, `${s.valor}${s.alterado ? ' (alterado)' : ''}`])), '')
    for (const u of m.atualizaExames ?? []) L.push(`- Resultado novo de ${u.id}: ${u.resultado}${u.imagem ? ` Imagem ${u.imagem.id}.` : ''}`)
    for (const u of m.atualizaExameFisico ?? []) L.push(`- Achado novo de ${u.id}: ${u.achado}`)
    if (m.atualizaExames?.length || m.atualizaExameFisico?.length) L.push('')
    L.push(`**Pergunta:** ${m.pergunta}`, '')
    L.push(`**Ações disponíveis:** ${(m.acoesDisponiveis ?? ['anamnese', 'exameFisico', 'exames', 'conduta']).map((a) => ACAO[a]).join(', ')}.`, '')
    L.push(`**Se a conduta for ideal ou aceitável, segue para:** ${nomeDoCodigo(caso, m.proximo)}`, '')
  }
  L.push(
    '## Regras de evolução',
    '',
    'O que acontece quando o aluno decide fora do esperado. Quando mais de uma regra se aplica, vale a do item mais grave.',
    '',
    tabela(['Regra', 'Momento', 'Se o aluno', 'Então', 'Vai para', 'Acionada por'], c.regras.map((r) => [
      r.codigo,
      r.momento,
      r.se,
      r.entao,
      nomeDoCodigo(caso, r.vaiPara) + (r.marcaDesfecho ? `; o caso termina em ${r.marcaDesfecho}` : ''),
      r.disparadaPor?.length ? r.disparadaPor.map((d) => `"${d}"`).join(' ou ') : r.quando ? `quando ${descreverCondicao(caso, r.quando)}` : '',
    ])),
    '',
    '## Desfechos',
    '',
    tabela(['Desfecho', 'Qualidade', 'Texto'], c.desfechos.map((d) => [d.codigo, QUALIDADE[d.qualidade] ?? '', d.texto])),
    '',
    '# Parte 2: folha resposta',
    '',
    'O que se espera do aluno em cada momento. A classificação vem do item mais grave: um erro crítico pesa mais que vários acertos. Sem erro, quem cobre todos os itens ideais tem conduta ideal; quem cobre parte, aceitável.',
    '',
  )
  for (const f of fr.momentos) {
    const m = c.momentos.find((x) => x.codigo === f.codigo)
    L.push(`## ${f.codigo}: ${m?.nome ?? ''}`, '')
    L.push(`Peso: ${fr.pesos[f.codigo.replace(/-ALT$/, '')]} pontos${f.codigo.endsWith('-ALT') ? ` (usa o peso do ${f.codigo.replace(/-ALT$/, '')})` : ''}.`, '')
    L.push('**Ideal**', '', lista(f.ideal), '')
    if (f.aceitaveis?.length) L.push('**Aceitável**', '', lista(f.aceitaveis), '')
    if (f.subotimas?.length) L.push('**Subótimo**', '', tabela(['Conduta', 'Custo'], f.subotimas.map((s) => [s.conduta, s.custo])), '')
    if (f.errosCriticos.length) L.push('**Erro crítico**', '', lista(f.errosCriticos), '')
    if (f.pontosDeRaciocinio?.length) L.push('**Pontos de raciocínio**', '', lista(f.pontosDeRaciocinio), '')
    L.push('**Justificativa**', '', lista(f.justificativa), '')
    const der = f.modoLista?.derivados ?? []
    if (der.length) {
      L.push('**Avaliado pelo que o aluno fez, e não por marcação na lista**', '')
      L.push(lista(der.map((d) => `"${d.item}": conta quando ${descreverCondicao(caso, d.quando)}${d.tambemComoOpcao ? ' (também aparece como opção)' : ''}.`)), '')
    }
    const rot = Object.entries(f.modoLista?.rotulos ?? {})
    if (rot.length) L.push('**Textos mostrados na lista** (para não entregar a resposta)', '', tabela(['Texto da folha', 'Texto na lista'], rot), '')
  }
  L.push(
    '## Pontuação',
    '',
    tabela(['Momento', 'Peso'], Object.entries(fr.pesos)),
    '',
    `Escala por classificação: ideal ${fr.escala.ideal}%, aceitável ${fr.escala.aceitavel}%, subótima ${fr.escala.subotima}%, perigosa ${fr.escala.perigosa}%; não prevista não pontua nem penaliza. A nota considera só os momentos jogados.`,
    '',
    tabela(['Nota', 'Faixa'], (fr.faixas ?? []).map((x) => [`${x.de} a ${x.ate}`, x.rotulo])),
    '',
    '## Mensagens-chave',
    '',
    lista(fr.mensagensChave),
    '',
    '## Referências',
    '',
    lista(id.referencias ?? []),
    '',
    '# Imagens necessárias',
    '',
    `Pasta: \`public/imagens/casos/${caso.id.toLowerCase()}/\`. Cada imagem precisa de fonte e licença registradas no caso.`,
    '',
  )
  const imgs = imagensDoCaso(caso)
  L.push(
    imgs.length
      ? tabela(['Situação', 'Código', 'Arquivo', 'Exame', 'Quando aparece', 'O que a imagem precisa mostrar', 'Fonte e licença'], imgs.map((x) => [
          x.existe ? 'No lugar' : '**Falta**',
          x.img.id,
          x.arquivos.join(', '),
          x.exame,
          x.quando,
          x.mostra,
          `${x.img.fonte ?? ''}; ${x.img.licenca ?? ''}`,
        ]))
      : 'O caso não usa imagens.',
    '',
    '# Decisões pendentes de validação',
    '',
    lista(pendencias[caso.id] ?? ['Nenhuma registrada.']),
    '',
  )
  return L.join('\n')
}

for (const caso of casos) writeFileSync(join('docs', 'casos', `${caso.id}.md`), documento(caso))

// Índice
writeFileSync(
  join('docs', 'casos', 'README.md'),
  [
    AVISO,
    '',
    '# Casos do simulador',
    '',
    'Três casos de abdome agudo obstrutivo, do delgado ao cólon. Cada documento traz o caso, a folha resposta, as imagens necessárias e as decisões que ainda precisam de validação clínica.',
    '',
    tabela(['Caso', 'Título', 'Tema', 'Momentos', 'Imagens que faltam'], casos.map((c) => [
      `[${c.id}](${c.id}.md)`,
      c.caso.identificacao.titulo,
      c.caso.identificacao.tema,
      c.caso.momentos.length,
      imagensDoCaso(c).filter((i) => !i.existe).length,
    ])),
    '',
    'Para atualizar estes documentos depois de mudar um caso: `npm run documentos`.',
    '',
  ].join('\n'),
)

// Imagens pendentes de todos os casos
const linhasImg = casos.flatMap((c) => imagensDoCaso(c).map((x) => ({ c, ...x })))
writeFileSync(
  join('docs', 'IMAGENS-PENDENTES.md'),
  [
    AVISO,
    '',
    '# Imagens pendentes',
    '',
    `${linhasImg.filter((x) => !x.existe).length} de ${linhasImg.length} imagens ainda faltam. Para conferir a qualquer momento: \`npm run imagens\`. O painel do professor também mostra o que falta.`,
    '',
    '## Como entregar',
    '',
    '- Formato JPG, de preferência com o lado maior entre 1200 e 1600 px.',
    '- Sem nenhum dado de paciente visível: nome, data de nascimento, prontuário, hospital.',
    '- Coloque cada arquivo na pasta do caso, com o nome exato da tabela: `public/imagens/casos/caso-NNN/`.',
    '- Série de tomografia: uma pasta com `01.jpg`, `02.jpg`... em sequência. Informe a quantidade para registrar no caso.',
    '- Para cada imagem, anote a fonte (no Radiopaedia: autor, número do caso rID e link) e a licença (normalmente CC BY-NC-SA). Imagem sem crédito não pode ser publicada.',
    '',
    '## Onde procurar',
    '',
    '- Radiopaedia.org: "adhesive small bowel obstruction", "Gastrografin challenge", "sigmoid volvulus coffee bean sign", "sigmoid volvulus whirl sign", "large bowel obstruction sigmoid carcinoma", "closed loop obstruction caecum".',
    '- Imagens de serviço próprio, se houver: totalmente anonimizadas e com autorização registrada.',
    '',
    ...casos.flatMap((c) => {
      const imgs = imagensDoCaso(c)
      return [
        `## ${c.id}: ${c.caso.identificacao.tema.replace(/^Abdome agudo obstrutivo: /, '')}`,
        '',
        tabela(['Situação', 'Código', 'Arquivo', 'Quando aparece', 'O que precisa mostrar'], imgs.map((x) => [x.existe ? 'No lugar' : '**Falta**', x.img.id, x.arquivos.join(', '), x.quando, x.mostra])),
        '',
      ]
    }),
  ].join('\n'),
)

console.log(`Gerados: ${casos.map((c) => `docs/casos/${c.id}.md`).join(', ')}, docs/casos/README.md e docs/IMAGENS-PENDENTES.md`)
