// Gera os documentos em Word para revisão do professor, a partir dos arquivos do simulador:
//   docs/casos/word/CASO-NNN-caso-clinico.docx    o que o aluno pode descobrir e como o caso evolui
//   docs/casos/word/CASO-NNN-folha-resposta.docx  o que se espera do aluno, pontuação e pontos para validação
// Uso: npm run documentos:word. As correções do professor voltam para casos/caso-NNN.json.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

const casos = readdirSync('casos')
  .filter((f) => /^caso-\d{3}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join('casos', f), 'utf8')))
const pendencias = JSON.parse(readFileSync('docs/casos/pendencias.json', 'utf8'))
const PASTA = join('docs', 'casos', 'word')
mkdirSync(PASTA, { recursive: true })

// ---------------------------------------------------------------- estilo
const VERDE = '6E7D0C'
const CINZA = '5C5C55'
const FUNDO_CABECALHO = 'E8EDC4'
const FUNDO_DESTAQUE = 'F3F3EE'
const LARGURA = 9638 // A4 com margens de 2 cm, em DXA
const QUALIDADE = { otimo: 'ótimo', bom: 'bom', ruim: 'ruim', grave: 'grave' }
const ACAO = { anamnese: 'perguntar ao paciente', exameFisico: 'examinar', exames: 'pedir exames', conduta: 'definir a conduta' }

const t = (texto, opcoes = {}) => new TextRun({ text: String(texto ?? ''), ...opcoes })
const p = (conteudo, opcoes = {}) =>
  new Paragraph({ children: Array.isArray(conteudo) ? conteudo : [t(conteudo)], spacing: { after: 120 }, ...opcoes })
const h1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(texto)] })
const h2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(texto)] })
const h3 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(texto)] })
const rotulo = (texto) => p([t(texto, { bold: true })], { spacing: { before: 160, after: 60 } })
const nota = (texto) => p([t(texto, { italics: true, color: CINZA })])
const marcadores = (itens) => itens.map((i) => new Paragraph({ children: [t(i)], numbering: { reference: 'marcador', level: 0 }, spacing: { after: 60 } }))
const numerados = (itens, ref) => itens.map((i) => new Paragraph({ children: [t(i)], numbering: { reference: ref, level: 0 }, spacing: { after: 60 } }))

function tabela(cabecalho, linhas, proporcoes) {
  const soma = proporcoes.reduce((a, b) => a + b, 0)
  const larguras = proporcoes.map((x) => Math.floor((x / soma) * LARGURA))
  larguras[larguras.length - 1] += LARGURA - larguras.reduce((a, b) => a + b, 0)
  const borda = { style: BorderStyle.SINGLE, size: 4, color: 'D8D8CF' }
  const bordas = { top: borda, bottom: borda, left: borda, right: borda }
  const celula = (texto, i, cab) =>
    new TableCell({
      width: { size: larguras[i], type: WidthType.DXA },
      borders: bordas,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      shading: cab ? { type: ShadingType.CLEAR, color: 'auto', fill: FUNDO_CABECALHO } : undefined,
      children: String(texto ?? '')
        .split('\n')
        .map((linha) => new Paragraph({ children: [t(linha, cab ? { bold: true } : {})] })),
    })
  return new Table({
    width: { size: LARGURA, type: WidthType.DXA },
    columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, children: cabecalho.map((c, i) => celula(c, i, true)) }),
      ...linhas.map((l) => new TableRow({ children: l.map((c, i) => celula(c, i, false)) })),
    ],
  })
}

const espaco = () => new Paragraph({ children: [], spacing: { after: 120 } })

// Caixa de destaque: parágrafo sombreado com borda verde à esquerda.
const caixa = (linhas) =>
  linhas.map(
    (l, i) =>
      new Paragraph({
        children: Array.isArray(l) ? l : [t(l)],
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: FUNDO_DESTAQUE },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: VERDE, space: 8 } },
        spacing: { before: i === 0 ? 120 : 0, after: i === linhas.length - 1 ? 200 : 40 },
        indent: { left: 160 },
      }),
  )

function documento(titulo, subtitulo, filhos) {
  return new Document({
    creator: 'Simulador de Casos Clínicos',
    title: titulo,
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 40, bold: true, color: '111110' }, paragraph: { spacing: { after: 120 } } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: VERDE }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 25, bold: true, color: '111110' }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 22, bold: true, color: CINZA }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [
        { reference: 'marcador', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
        ...['n1', 'n2', 'n3', 'n4'].map((ref) => ({
          reference: ref,
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 320 } } } }],
        })),
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        headers: {
          default: new Header({
            children: [p([t('Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão  |  Simulador de casos clínicos', { size: 16, color: CINZA })], { alignment: AlignmentType.RIGHT })],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              p([t(`${subtitulo}  |  Rascunho para validação  |  Página `, { size: 16, color: CINZA }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: CINZA }), t(' de ', { size: 16, color: CINZA }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: CINZA })], {
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: filhos,
      },
    ],
  })
}

function nomeDoCodigo(caso, cod) {
  const m = caso.caso.momentos.find((x) => x.codigo === cod)
  if (m) return `${cod}, ${m.nome}`
  const d = caso.caso.desfechos.find((x) => x.codigo === cod)
  return d ? `Desfecho ${cod} (${QUALIDADE[d.qualidade] ?? ''})` : cod
}

function imagensDoCaso(caso) {
  const lista = []
  for (const e of caso.caso.exames) {
    if (!e.imagem) continue
    const at = caso.caso.momentos.flatMap((m) => (m.atualizaExames ?? []).filter((u) => u.id === e.id && !u.imagem))
    const mostra = /disponível apenas/i.test(e.resultado) && at.length ? at[0].resultado : e.resultado
    lista.push([e.imagem.id, e.nome, e.disponivelAPartirDe ? `A partir do ${e.disponivelAPartirDe}` : 'Em qualquer momento', mostra, e.imagem.arquivo.endsWith('/') ? 'Série de cortes' : 'Imagem única'])
  }
  for (const m of caso.caso.momentos)
    for (const u of m.atualizaExames ?? []) {
      if (!u.imagem) continue
      const e = caso.caso.exames.find((x) => x.id === u.id)
      lista.push([u.imagem.id, `${e?.nome ?? u.id} (repetido)`, `No ${m.codigo}, ${m.nome}`, u.resultado, 'Imagem única'])
    }
  return lista
}

const numeroDoCaso = (caso) => Number(caso.id.slice(5))

const comoRevisar = (qual) => [
  h1('Como revisar este documento'),
  ...caixa([
    'Use "Revisar > Controlar alterações" no Word para que cada correção fique marcada, e comentários para dúvidas.',
    qual === 'caso'
      ? 'Os textos deste documento aparecem para o aluno exatamente como estão escritos. A IA não inventa informação clínica: o que não estiver aqui, o paciente não sabe.'
      : 'Esta folha é a única referência da avaliação. A IA não usa conhecimento próprio para corrigir o aluno: se um item estiver errado aqui, a correção do aluno sai errada.',
    qual === 'caso'
      ? 'A folha resposta deste caso está no outro documento. Os pontos que ainda precisam de decisão estão no fim da folha resposta.'
      : 'Os pontos que ainda precisam de decisão estão na última seção, "Pontos para validação".',
  ]),
]

// ---------------------------------------------------------------- caso clínico
function documentoCaso(caso) {
  const c = caso.caso
  const id = c.identificacao
  const n = numeroDoCaso(caso)
  const filhos = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [t(`Caso clínico ${n}`)] }),
    p([t(id.titulo, { size: 28, color: CINZA })], { spacing: { after: 240 } }),
    tabela(
      ['Item', 'Descrição'],
      [
        ['Tema', id.tema],
        ['Público', id.publico ?? ''],
        ['Tempo estimado', id.tempoEstimado],
        ['Autor', id.autor],
        ['Versão', caso.versao],
        ['Situação', 'Rascunho para validação do conteúdo clínico'],
      ],
      [1, 3],
    ),
    ...comoRevisar('caso'),

    h1('1. Apresentação inicial'),
    p(c.apresentacaoInicial.texto),
    tabela(['Sinal vital', 'Valor'], c.apresentacaoInicial.sinaisVitais.map((s) => [s.rotulo, `${s.valor}${s.alterado ? ' (alterado)' : ''}`]), [1, 1]),
    espaco(),
    p([t('Pergunta ao aluno: ', { bold: true }), t(c.apresentacaoInicial.pergunta)]),
  ]

  if (c.paciente) {
    filhos.push(
      h1('2. O paciente'),
      p([t(`${c.paciente.nome}, ${c.paciente.idade} anos.`, { bold: true }), t(c.paciente.acompanhante ? ` Acompanhante: ${c.paciente.acompanhante}.` : '')]),
      p(c.paciente.jeito),
      nota('No simulador com IA, o paciente conversa nesse jeito, mas só com o que está escrito neste documento. Cada fala é conferida pelo sistema antes de aparecer para o aluno.'),
    )
  }

  filhos.push(
    h1('3. Anamnese'),
    nota('Respostas na voz do paciente. É exatamente o que ele responde quando o aluno pergunta sobre cada tema.'),
    tabela(['Tema', 'Resposta do paciente'], c.anamnese.map((a) => [a.tema, a.resposta]), [1, 3]),

    h1('4. Exame físico'),
    tabela(['Segmento', 'Achado'], c.exameFisico.map((e) => [e.segmento, e.achado]), [1, 3]),

    h1('5. Exames complementares'),
    tabela(
      ['Exame', 'Resultado', 'Observação'],
      c.exames.map((e) => [e.nome, e.resultado, [e.disponivelAPartirDe ? `Disponível a partir do ${e.disponivelAPartirDe}.` : '', e.imagem ? `Tem imagem (${e.imagem.id}).` : ''].filter(Boolean).join(' ')]),
      [2, 5, 2],
    ),

    h1('6. Quando o aluno pede algo que não está no caso'),
    tabela(
      ['Situação', 'Resposta'],
      [
        ['Pergunta que não está no caso', c.respostaPadrao.perguntaNaoListada],
        ['Exame de laboratório que não está no caso', c.respostaPadrao.laboratorioNaoListado],
        ['Exame de imagem que não está no caso', c.respostaPadrao.imagemNaoListada],
        ['Segmento do exame físico que não está no caso', c.respostaPadrao.exameFisicoNaoListado ?? ''],
        ['Pedido de parecer de especialista', c.respostaPadrao.parecerEspecialista ?? ''],
      ],
      [2, 3],
    ),

    h1('7. Evolução do caso, momento a momento'),
    nota('Em cada momento o aluno pode perguntar, examinar, pedir exames e definir a conduta. A conduta faz o caso avançar.'),
  )
  for (const m of c.momentos) {
    filhos.push(h2(`${m.codigo}: ${m.nome}`))
    if (m.tempo) filhos.push(p([t(m.tempo, { italics: true })]))
    filhos.push(p(m.codigo === c.momentos[0].codigo ? 'Situação: a apresentação inicial.' : m.situacao))
    if (m.sinaisVitais?.length) filhos.push(tabela(['Sinal vital', 'Valor'], m.sinaisVitais.map((s) => [s.rotulo, `${s.valor}${s.alterado ? ' (alterado)' : ''}`]), [1, 1]), espaco())
    const novos = [
      ...(m.atualizaExames ?? []).map((u) => `${c.exames.find((e) => e.id === u.id)?.nome ?? u.id}: ${u.resultado}`),
      ...(m.atualizaExameFisico ?? []).map((u) => `${c.exameFisico.find((e) => e.id === u.id)?.segmento ?? u.id}: ${u.achado}`),
    ]
    if (novos.length) filhos.push(rotulo('Resultados novos neste momento'), ...marcadores(novos))
    filhos.push(p([t('Pergunta ao aluno: ', { bold: true }), t(m.pergunta)]))
    filhos.push(p([t('O aluno pode: ', { bold: true }), t((m.acoesDisponiveis ?? Object.keys(ACAO)).map((a) => ACAO[a]).join(', ') + '.')]))
    filhos.push(p([t('Se a conduta for ideal ou aceitável, segue para: ', { bold: true }), t(nomeDoCodigo(caso, m.proximo))]))
  }

  filhos.push(
    h1('8. O que acontece quando o aluno decide fora do esperado'),
    nota('Quando mais de uma regra se aplica, vale a da conduta mais grave.'),
    tabela(
      ['Regra', 'Momento', 'Se o aluno', 'Então', 'O caso vai para'],
      c.regras.map((r) => [r.codigo, r.momento, r.se, r.entao, nomeDoCodigo(caso, r.vaiPara) + (r.marcaDesfecho ? `, e termina no desfecho ${r.marcaDesfecho}` : '')]),
      [0.8, 1, 3, 3, 2],
    ),

    h1('9. Desfechos'),
    tabela(['Desfecho', 'Qualidade', 'O que acontece'], c.desfechos.map((d) => [d.codigo, QUALIDADE[d.qualidade] ?? '', d.texto]), [1, 1, 5]),

    h1('10. Imagens necessárias'),
    nota('Cada imagem precisa de fonte e licença (por exemplo, autor e número do caso no Radiopaedia). A imagem precisa mostrar o que o resultado descreve.'),
  )
  const imgs = imagensDoCaso(caso)
  filhos.push(imgs.length ? tabela(['Código', 'Exame', 'Quando aparece', 'O que a imagem precisa mostrar', 'Tipo'], imgs, [1.2, 2, 1.6, 4.5, 1.2]) : p('O caso não usa imagens.'))
  filhos.push(h1('11. Referências'), ...marcadores(id.referencias ?? []))
  return documento(`Caso clínico ${n}: ${id.titulo}`, `Caso clínico ${n}`, filhos)
}

// ---------------------------------------------------------------- folha resposta
function documentoFolha(caso) {
  const c = caso.caso
  const fr = caso.folhaResposta
  const n = numeroDoCaso(caso)
  const filhos = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [t(`Folha resposta, caso clínico ${n}`)] }),
    p([t(c.identificacao.titulo, { size: 28, color: CINZA })], { spacing: { after: 240 } }),
    ...comoRevisar('folha'),

    h1('1. Objetivos de aprendizagem'),
    ...numerados(fr.objetivos, 'n1'),

    h1('2. Resumo do caminho ideal'),
    p(fr.caminhoIdeal),
  ]

  const dx = fr.diagnostico
  if (dx) {
    filhos.push(
      h1('3. Hipótese diagnóstica'),
      p(`O aluno registra a hipótese antes de concluir o ${dx.momento}. Ela vale ${dx.peso}% da nota final: correta conta 100%, incompleta 50% e incorreta 0%.`),
      ...caixa([[t('Diagnóstico correto: ', { bold: true }), t(dx.correto)]]),
      rotulo('Hipóteses incompletas (no caminho certo)'),
      ...marcadores(dx.parciais),
      rotulo('Hipóteses incorretas'),
      nota('Também aparecem, junto com a correta e as incompletas, como alternativas na lista do simulador estático.'),
      ...marcadores(dx.incorretos),
      rotulo('Como chegar ao diagnóstico'),
      ...numerados(dx.raciocinio, 'n2'),
      rotulo('Diagnósticos diferenciais'),
      tabela(['Diferencial', 'Como afastar'], dx.diferenciais.map((d) => [d.diagnostico, d.comoAfastar]), [1, 2]),
    )
  }

  filhos.push(
    h1('4. Como a conduta é classificada'),
    ...marcadores([
      'Erro crítico: a conduta é perigosa (0% do peso do momento).',
      'Subótimo, sem erro crítico: a conduta é subótima (50%).',
      'Todos os itens ideais, sem erro: a conduta é ideal (100%).',
      'Sem erro, mas sem todos os itens ideais: a conduta é aceitável (80%).',
      'Conduta que não corresponde a nenhum item: não prevista. Não pontua, não penaliza e fica registrada para o professor.',
      'Vale o item mais grave: um erro crítico pesa mais que vários acertos.',
    ]),

    h1('5. Folha resposta por momento'),
  )

  for (const f of fr.momentos) {
    const m = c.momentos.find((x) => x.codigo === f.codigo)
    const base = f.codigo.replace(/-ALT$/, '')
    filhos.push(h2(`${f.codigo}: ${m?.nome ?? ''}`))
    filhos.push(nota(`Peso: ${fr.pesos[base]} pontos${f.codigo.endsWith('-ALT') ? ` (usa o peso do ${base}; é o caminho alternativo, quando o caso se complica)` : ''}. Pergunta ao aluno: ${m?.pergunta ?? ''}`))
    filhos.push(rotulo('Ideal'), ...marcadores(f.ideal))
    if (f.aceitaveis?.length) filhos.push(rotulo('Aceitável'), ...marcadores(f.aceitaveis))
    if (f.subotimas?.length) filhos.push(rotulo('Subótimo'), tabela(['Conduta', 'Custo'], f.subotimas.map((s) => [s.conduta, s.custo]), [1, 1]))
    if (f.errosCriticos.length) filhos.push(rotulo('Erro crítico'), ...marcadores(f.errosCriticos))
    if (f.pontosDeRaciocinio?.length) filhos.push(rotulo('Pontos de raciocínio'), ...marcadores(f.pontosDeRaciocinio))
    filhos.push(rotulo('Justificativa'), ...marcadores(f.justificativa))

    const regras = c.regras.filter((r) => r.momento === f.codigo)
    if (regras.length) {
      filhos.push(
        rotulo('Consequências de decisões fora do esperado'),
        tabela(['Regra', 'Se o aluno', 'Então', 'O caso vai para'], regras.map((r) => [r.codigo, r.se, r.entao, nomeDoCodigo(caso, r.vaiPara) + (r.marcaDesfecho ? `, e termina no desfecho ${r.marcaDesfecho}` : '')]), [0.8, 3, 3, 2]),
      )
    }
    const efeitos = Object.entries(f.efeitos ?? {})
    if (efeitos.length) {
      filhos.push(
        rotulo('O que acontece com o paciente na hora, quando o aluno faz a conduta'),
        tabela(['Conduta', 'Efeito no paciente', 'Sinais vitais'], efeitos.map(([item, e]) => [item, e.texto, (e.sinaisVitais ?? []).map((s) => `${s.rotulo}: ${s.valor}`).join('\n')]), [3, 4, 1.6]),
      )
    }
    const derivados = f.modoLista?.derivados ?? []
    if (derivados.length) {
      const nomeId = (x) => {
        const i = [...c.anamnese, ...c.exameFisico, ...c.exames].find((y) => y.id === x)
        return i ? (i.tema ?? i.segmento ?? i.nome).toLowerCase() : x
      }
      const descrever = (q) =>
        [
          q.revelados?.length ? `o aluno investigou: ${q.revelados.map(nomeId).join(', ')}` : '',
          q.naoRevelados?.length ? `o aluno não investigou: ${q.naoRevelados.map(nomeId).join(', ')}` : '',
          q.selecionados?.length ? `escolheu: ${q.selecionados.join(' / ')}` : '',
          q.nenhumSelecionado?.length ? `não escolheu: ${q.nenhumSelecionado.join(' / ')}` : '',
        ]
          .filter(Boolean)
          .join('; ')
      filhos.push(
        rotulo('Itens que o simulador avalia pelo que o aluno fez'),
        nota('Estes itens não aparecem como opção para marcar: contam pelo que o aluno de fato investigou ou deixou de fazer.'),
        tabela(['Item da folha', 'Conta quando'], derivados.map((d) => [d.item, descrever(d.quando)]), [1, 1]),
      )
    }
    const rotulos = Object.entries(f.modoLista?.rotulos ?? {})
    if (rotulos.length) {
      filhos.push(
        rotulo('Textos mostrados na lista do simulador estático'),
        nota('O texto da folha entregaria a resposta, então a lista mostra um texto neutro. Confira se descreve a mesma conduta.'),
        tabela(['Texto da folha', 'Texto mostrado ao aluno'], rotulos, [1, 1]),
      )
    }
  }

  filhos.push(
    h1('6. Pontuação'),
    tabela(['Momento', 'Peso'], Object.entries(fr.pesos).map(([k, v]) => [nomeDoCodigo(caso, k), `${v} pontos`]), [3, 1]),
    espaco(),
    p(
      `Escala por momento: ideal ${fr.escala.ideal}%, aceitável ${fr.escala.aceitavel}%, subótima ${fr.escala.subotima}%, perigosa ${fr.escala.perigosa}%; conduta não prevista não pontua nem penaliza. Se o caso terminar antes do último momento, a nota considera só os momentos jogados.${dx ? ` A hipótese diagnóstica vale ${dx.peso}% da nota final.` : ''}`,
    ),
    tabela(['Nota', 'Faixa'], (fr.faixas ?? []).map((x) => [`${x.de} a ${x.ate}`, x.rotulo]), [1, 2]),

    h1('7. Mensagens-chave'),
    ...numerados(fr.mensagensChave, 'n3'),

    h1('8. Referências'),
    ...marcadores(c.identificacao.referencias ?? []),

    h1('9. Pontos para validação'),
    nota('Decisões tomadas no desenvolvimento que precisam da confirmação ou da correção do professor.'),
    ...numerados(pendencias[caso.id] ?? ['Nenhum ponto registrado.'], 'n4'),
  )
  return documento(`Folha resposta, caso clínico ${n}`, `Folha resposta, caso clínico ${n}`, filhos)
}

for (const caso of casos) {
  const base = join(PASTA, caso.id)
  writeFileSync(`${base}-caso-clinico.docx`, await Packer.toBuffer(documentoCaso(caso)))
  writeFileSync(`${base}-folha-resposta.docx`, await Packer.toBuffer(documentoFolha(caso)))
  console.log(`${base}-caso-clinico.docx e ${base}-folha-resposta.docx`)
}
