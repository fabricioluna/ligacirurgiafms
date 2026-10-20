// Estilo e peças comuns dos documentos em Word para revisão do professor.

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

// ---------------------------------------------------------------- estilo
export const VERDE = '6E7D0C'
export const CINZA = '5C5C55'
export const FUNDO_CABECALHO = 'E8EDC4'
export const FUNDO_DESTAQUE = 'F3F3EE'
export const LARGURA = 9638 // A4 com margens de 2 cm, em DXA
export const QUALIDADE = { otimo: 'ótimo', bom: 'bom', ruim: 'ruim', grave: 'grave' }
export const ACAO = { anamnese: 'perguntar ao paciente', exameFisico: 'examinar', exames: 'pedir exames', conduta: 'definir a conduta' }

export const t = (texto, opcoes = {}) => new TextRun({ text: String(texto ?? ''), ...opcoes })
export const p = (conteudo, opcoes = {}) =>
  new Paragraph({ children: Array.isArray(conteudo) ? conteudo : [t(conteudo)], spacing: { after: 120 }, ...opcoes })
export const h1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(texto)] })
export const h2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(texto)] })
export const h3 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(texto)] })
export const rotulo = (texto) => p([t(texto, { bold: true })], { spacing: { before: 160, after: 60 } })
export const nota = (texto) => p([t(texto, { italics: true, color: CINZA })])
export const marcadores = (itens) => itens.map((i) => new Paragraph({ children: [t(i)], numbering: { reference: 'marcador', level: 0 }, spacing: { after: 60 } }))
export const numerados = (itens, ref) => itens.map((i) => new Paragraph({ children: [t(i)], numbering: { reference: ref, level: 0 }, spacing: { after: 60 } }))

export function tabela(cabecalho, linhas, proporcoes) {
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

export const espaco = () => new Paragraph({ children: [], spacing: { after: 120 } })

// Caixa de destaque: parágrafo sombreado com borda verde à esquerda.
export const caixa = (linhas) =>
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

export function documento(titulo, subtitulo, filhos) {
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
