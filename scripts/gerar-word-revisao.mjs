// Gera, para cada caso, um documento em Word para o professor revisar o simulador como o aluno o joga
// (modo guiado): o caso, cada decisão com as alternativas, a classificação, o que acontece e a explicação,
// os desfechos, a discussão, as imagens e os pontos que precisam de validação.
//   docs/casos/word/CASO-NNN-revisao.docx
// Uso: npm run documentos:revisao (precisa do Node 22.6 ou mais novo, que lê os roteiros em TypeScript).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { AlignmentType, HeadingLevel, ImageRun, Packer, PageBreak, Paragraph } from 'docx'
import { CINZA, QUALIDADE, caixa, documento, h1, h2, h3, marcadores, nota, numerados, p, rotulo, t, tabela } from './word-comum.mjs'
import { roteiro001 } from '../src/guiado/roteiros/caso-001.ts'
import { roteiro002 } from '../src/guiado/roteiros/caso-002.ts'
import { roteiro003 } from '../src/guiado/roteiros/caso-003.ts'
import { pastaDeIlustracoes, todasAsIlustracoes } from '../src/guiado/ilustracoes.ts'

const ROTEIROS = [roteiro001, roteiro002, roteiro003]
const casos = readdirSync('casos')
  .filter((f) => /^caso-\d{3}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join('casos', f), 'utf8')))
const pendencias = JSON.parse(readFileSync('docs/casos/pendencias.json', 'utf8'))
const PASTA = join('docs', 'casos', 'word')
mkdirSync(PASTA, { recursive: true })

const CLASSE = { ideal: 'Ideal', aceitavel: 'Aceitável', subotima: 'Subótima', perigosa: 'Perigosa (erro crítico)' }
const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

// Largura e altura de um JPEG, lidas do cabeçalho (marcador SOF).
function tamanhoJpeg(buf) {
  let i = 2
  while (i < buf.length) {
    const marcador = buf[i + 1]
    const tam = buf.readUInt16BE(i + 2)
    if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
      return { altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) }
    }
    i += 2 + tam
  }
  throw new Error('JPEG sem tamanho')
}

// Imagem centralizada, com no máximo 15 cm de largura e 12 cm de altura (em pixels a 96 dpi).
function figura(caminho, legenda) {
  if (!existsSync(caminho)) return [nota(`Imagem pendente: ${legenda}`)]
  const data = readFileSync(caminho)
  const { largura, altura } = tamanhoJpeg(data)
  const escala = Math.min(567 / largura, 454 / altura)
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({ type: 'jpg', data, transformation: { width: Math.round(largura * escala), height: Math.round(altura * escala) } })],
    }),
    p([t(legenda, { italics: true, size: 18, color: CINZA })], { alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
  ]
}

const pastaDoCaso = (caso) => join('public', 'imagens', 'casos', caso.id.toLowerCase())

function classificar(f, item) {
  if (f.ideal.includes(item)) return 'ideal'
  if ((f.aceitaveis ?? []).includes(item)) return 'aceitavel'
  if ((f.subotimas ?? []).some((s) => s.conduta === item)) return 'subotima'
  if (f.errosCriticos.includes(item)) return 'perigosa'
  throw new Error(`Item fora da folha: ${item}`)
}

// O que o aluno lê logo depois de escolher: o efeito, o custo da conduta subótima e o resultado da regra.
function consequencia(caso, f, momento, item) {
  const custo = (f.subotimas ?? []).find((s) => s.conduta === item)?.custo
  const regra = caso.caso.regras.find((r) => r.momento === momento && r.disparadaPor?.includes(item))
  return [f.efeitos?.[item]?.texto, custo && `Custo: ${custo}`, regra?.entao].filter(Boolean).join(' ')
}

function nomeDoDestino(caso, cod) {
  const m = caso.caso.momentos.find((x) => x.codigo === cod)
  if (m) return `Segue para ${cod} (${m.nome})`
  const d = caso.caso.desfechos.find((x) => x.codigo === cod)
  return d ? `Termina no desfecho ${cod} (${QUALIDADE[d.qualidade] ?? ''})` : cod
}

const exameDoId = (caso, id) => caso.caso.exames.find((e) => e.id === id)

// Valor de um exame num momento: a última atualização até ali no caminho esperado ou no ALT.
function resultadoNoMomento(caso, id, momento) {
  const u = caso.caso.momentos.find((m) => m.codigo === momento)?.atualizaExames?.find((x) => x.id === id)
  return u ?? exameDoId(caso, id)
}

function passoDoc(caso, roteiro, passo, ordem) {
  const c = caso.caso
  const m = c.momentos.find((x) => x.codigo === passo.momento)
  const f = caso.folhaResposta.momentos.find((x) => x.codigo === passo.momento)
  const rotuloDe = (item) => f.modoLista?.rotulos?.[item] ?? item
  const filhos = [h2(`Decisão ${ordem}. ${m.nome} (${m.codigo})`)]
  if (m.tempo) filhos.push(nota(m.tempo))

  filhos.push(rotulo('O que o aluno lê'))
  filhos.push(...caixa([passo.momento === roteiro.passos[0].momento ? c.apresentacaoInicial.texto : m.situacao]))
  if (m.sinaisVitais?.length) filhos.push(tabela(['Sinal vital', 'Valor'], m.sinaisVitais.map((s) => [s.rotulo, s.valor + (s.alterado ? '  (alterado)' : '')]), [2, 2]))
  if (m.atualizaExameFisico?.length) {
    filhos.push(rotulo('Exame físico que muda neste momento'))
    filhos.push(tabela(['Segmento', 'Achado'], m.atualizaExameFisico.map((u) => [c.exameFisico.find((e) => e.id === u.id)?.segmento ?? u.id, u.achado]), [1, 3]))
  }
  if (passo.resultados?.length) {
    filhos.push(rotulo('Exames que chegam sozinhos neste momento (reavaliação da equipe)'))
    filhos.push(
      tabela(
        ['Exame', 'Resultado mostrado', 'Observação'],
        passo.resultados.map((r) => {
          const ex = resultadoNoMomento(caso, r.id, passo.momento)
          return [exameDoId(caso, r.id).nome, ex.resultado, [ex.imagem ? `Com imagem ${ex.imagem.id}.` : '', r.seEscolheu ? `Só aparece se o aluno escolheu antes: "${r.seEscolheu}"` : ''].filter(Boolean).join(' ')]
        }),
        [2, 4, 2.4],
      ),
    )
  }
  for (const i of todasAsIlustracoes(caso.id).filter((x) => x.onde === passo.momento)) {
    filhos.push(...figura(join('public', pastaDeIlustracoes(caso.id), i.arquivo), `Ilustração mostrada ao aluno: ${i.legenda}`))
  }

  filhos.push(rotulo('Pergunta'), p(passo.momento === roteiro.passos[0].momento ? c.apresentacaoInicial.pergunta : m.pergunta))
  filhos.push(
    rotulo('Alternativas, na ordem em que aparecem'),
    tabela(
      ['', 'Texto que o aluno vê', 'Classificação', 'Depois da escolha'],
      passo.opcoes.map((o, i) => {
        const revela = (o.revela ?? []).map((id) => exameDoId(caso, id).nome)
        const destino = o.vai ? nomeDoDestino(caso, o.vai) + (o.marcaDesfecho ? `, e no fim o desfecho ${o.marcaDesfecho}` : '') : 'Fica no mesmo momento; o aluno escolhe de novo'
        return [LETRAS[i], rotuloDe(o.item), CLASSE[classificar(f, o.item)], [destino, revela.length ? `Mostra o resultado de: ${revela.join(', ')}.` : ''].filter(Boolean).join('\n')]
      }),
      [0.4, 4, 1.5, 3],
    ),
  )

  filhos.push(rotulo('O que o aluno lê depois de cada escolha'))
  passo.opcoes.forEach((o, i) => {
    filhos.push(p([t(`${LETRAS[i]}. ${rotuloDe(o.item)}`, { bold: true }), t(`  ${CLASSE[classificar(f, o.item)]}`, { color: CINZA })], { spacing: { before: 160, after: 60 } }))
    if (rotuloDe(o.item) !== o.item) filhos.push(nota(`Texto completo na folha resposta: ${o.item}`))
    const cons = consequencia(caso, f, passo.momento, o.item)
    if (cons) filhos.push(p([t('O que acontece: ', { bold: true }), t(cons)]))
    filhos.push(p([t('Explicação: ', { bold: true }), t(f.explicacoes?.[o.item] ?? 'SEM EXPLICAÇÃO')]))
  })

  const oferecidas = new Set(passo.opcoes.map((o) => o.item))
  const fora = [
    ...f.ideal.map((x) => [x, 'Ideal']),
    ...(f.aceitaveis ?? []).map((x) => [x, 'Aceitável']),
    ...(f.subotimas ?? []).map((x) => [x.conduta, 'Subótima']),
    ...f.errosCriticos.map((x) => [x, 'Perigosa (erro crítico)']),
  ].filter(([x]) => !oferecidas.has(x))
  if (fora.length) {
    filhos.push(rotulo('Outras condutas da folha resposta, que não aparecem como alternativa neste momento'))
    filhos.push(tabela(['Conduta', 'Classificação'], fora, [5, 1.6]))
  }
  if (f.pontosDeRaciocinio?.length) filhos.push(rotulo('Raciocínio do momento (aparece no resultado)'), ...marcadores(f.pontosDeRaciocinio))
  if (f.justificativa?.length) filhos.push(rotulo('Base (aparece no resultado)'), ...marcadores(f.justificativa))
  return filhos
}

// Caminho esperado primeiro, depois os momentos de piora (ALT).
function ordemDosPassos(roteiro) {
  return [...roteiro.passos.filter((x) => !x.momento.endsWith('-ALT')), ...roteiro.passos.filter((x) => x.momento.endsWith('-ALT'))]
}

function documentoRevisao(caso) {
  const c = caso.caso
  const fr = caso.folhaResposta
  const id = c.identificacao
  const n = Number(caso.id.slice(5))
  const roteiro = ROTEIROS.find((r) => r.casoId === caso.id)
  const passos = ordemDosPassos(roteiro)
  const quebra = () => new Paragraph({ children: [new PageBreak()] })

  const filhos = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [t(`Caso clínico ${n}: revisão do simulador`)] }),
    p([t(id.titulo, { size: 28, color: CINZA })], { spacing: { after: 240 } }),
    tabela(
      ['Item', 'Descrição'],
      [
        ['Diagnóstico e tema', id.tema],
        ['Público', id.publico ?? ''],
        ['Tempo estimado', id.tempoEstimado],
        ['Autor', id.autor],
        ['Versão do caso', caso.versao],
        ['Situação', 'Rascunho para validação do conteúdo clínico'],
      ],
      [1, 3],
    ),

    h1('Como revisar este documento'),
    ...caixa([
      'O aluno joga o caso no modo guiado: em cada decisão, lê a situação, os sinais vitais e os exames, e escolhe entre 6 alternativas. Algumas alternativas mantêm o aluno no mesmo momento (ele escolhe de novo); outras fazem o caso avançar. Depois de cada escolha, ele vê a classificação, o que aconteceu com o paciente e a explicação.',
      'Este documento mostra tudo o que o aluno vê, na ordem em que vê. O simulador não inventa nada: o texto clínico, as classificações, as consequências e as explicações vêm exatamente daqui.',
      'Use "Revisar > Controlar alterações" no Word para que cada correção fique marcada, e comentários para as dúvidas. Os pontos que ainda dependem de decisão estão na última seção.',
      'O que conferir: a correção clínica de cada texto, a classificação de cada alternativa, para onde cada uma leva, as explicações e se cada imagem mostra o que o laudo descreve.',
    ]),

    h1('1. O que o aluno recebe na admissão'),
    rotulo('Apresentação'),
    ...caixa([c.apresentacaoInicial.texto]),
    tabela(['Sinal vital', 'Valor'], c.apresentacaoInicial.sinaisVitais.map((s) => [s.rotulo, s.valor]), [2, 2]),
    rotulo('História clínica (aparece no prontuário, com as palavras do paciente)'),
    tabela(['Tema', 'O que o paciente conta'], c.anamnese.map((a) => [a.tema, a.resposta]), [1.4, 4]),
    rotulo('Exame físico'),
    tabela(['Segmento', 'Achado'], c.exameFisico.map((e) => [e.segmento, e.achado]), [1.4, 4]),
    rotulo('Exames: resultado na admissão e mudanças ao longo do caso'),
    nota('O aluno só vê o resultado do exame que pediu, ou que a equipe trouxe na reavaliação de um momento.'),
    tabela(
      ['Exame', 'Na admissão', 'Depois'],
      c.exames.map((e) => [
        e.nome,
        e.resultado,
        c.momentos
          .flatMap((m) => (m.atualizaExames ?? []).filter((u) => u.id === e.id).map((u) => `${m.codigo}: ${u.resultado}`))
          .join('\n'),
      ]),
      [1.6, 3, 3.4],
    ),
    quebra(),

    h1('2. O caso, decisão por decisão'),
    nota('Primeiro o caminho esperado; depois os momentos de piora (ALT), aos quais o aluno chega por decisões erradas.'),
  ]
  passos.forEach((passo, i) => filhos.push(...passoDoc(caso, roteiro, passo, i + 1)))

  filhos.push(
    quebra(),
    h1('3. Desfechos'),
    tabela(
      ['Código', 'Qualidade', 'O que o aluno lê no fim', 'Como se chega'],
      c.desfechos.map((d) => {
        const caminhos = roteiro.passos.flatMap((ps) =>
          ps.opcoes.filter((o) => o.vai === d.codigo || o.marcaDesfecho === d.codigo).map((o) => `${ps.momento}: ${caso.folhaResposta.momentos.find((x) => x.codigo === ps.momento).modoLista?.rotulos?.[o.item] ?? o.item}`),
        )
        return [d.codigo, QUALIDADE[d.qualidade] ?? '', d.texto, caminhos.join('\n')]
      }),
      [0.8, 0.9, 3.6, 3.4],
    ),
    nota('Um desfecho marcado por uma alta indevida vale até o fim, exceto o óbito, que prevalece.'),

    h1('4. Discussão mostrada no resultado'),
  )
  const dx = fr.diagnostico
  if (dx) {
    filhos.push(rotulo('Diagnóstico'), ...caixa([dx.correto]))
    filhos.push(rotulo('Como chegar ao diagnóstico'), ...numerados(dx.raciocinio, 'n1'))
    filhos.push(rotulo('Diagnósticos diferenciais'), tabela(['Diagnóstico', 'Como afastar'], dx.diferenciais.map((d) => [d.diagnostico, d.comoAfastar]), [1.6, 4]))
  }
  filhos.push(rotulo('Caminho esperado'), p(fr.caminhoIdeal))
  filhos.push(rotulo('Mensagens principais'), ...numerados(fr.mensagensChave, 'n2'))
  filhos.push(rotulo('O que este caso treina'), ...marcadores(fr.objetivos))
  filhos.push(rotulo('Referências'), ...marcadores(id.referencias ?? []))

  filhos.push(
    h1('5. Nota'),
    p(
      `Em cada decisão, cada alternativa escolhida conta, e a decisão vale a média delas: ideal ${fr.escala.ideal}%, aceitável ${fr.escala.aceitavel}%, subótima ${fr.escala.subotima}%, perigosa ${fr.escala.perigosa}%. O peso de cada momento vem da tabela abaixo (o momento ALT usa o peso do momento que substitui), e a nota considera só os momentos jogados.`,
    ),
    tabela(['Momento', 'Peso'], Object.entries(fr.pesos).map(([k, v]) => [k, String(v)]), [1, 1]),
    tabela(['Nota', 'Faixa'], (fr.faixas ?? []).map((x) => [`${x.de} a ${x.ate}`, x.rotulo]), [1, 2]),
  )

  filhos.push(quebra(), h1('6. Imagens'))
  filhos.push(nota('Imagens de exame simuladas por inteligência artificial, sem paciente real. Conferir se cada uma mostra o que o laudo descreve.'))
  const imagens = [
    ...c.exames.filter((e) => e.imagem).map((e) => ({ img: e.imagem, nome: e.nome, laudo: /^Disponível apenas/.test(e.resultado) ? (c.momentos.flatMap((m) => m.atualizaExames ?? []).find((u) => u.id === e.id)?.resultado ?? e.resultado) : e.resultado })),
    ...c.momentos.flatMap((m) => (m.atualizaExames ?? []).filter((u) => u.imagem).map((u) => ({ img: u.imagem, nome: `${exameDoId(caso, u.id).nome} (${m.codigo})`, laudo: u.resultado }))),
  ]
  for (const x of imagens) {
    filhos.push(h3(`${x.img.id}: ${x.nome}`), p([t('Laudo: ', { bold: true }), t(x.laudo)]))
    filhos.push(...figura(join(pastaDoCaso(caso), x.img.arquivo), x.img.legenda ?? x.nome))
  }
  const ilustracoesResultado = todasAsIlustracoes(caso.id).filter((i) => i.onde === 'resultado')
  if (ilustracoesResultado.length) {
    filhos.push(h2('Ilustrações do resultado'), nota('Ilustrações didáticas geradas por IA, mostradas só no fim, para não entregar o diagnóstico.'))
    for (const i of ilustracoesResultado) filhos.push(...figura(join('public', pastaDeIlustracoes(caso.id), i.arquivo), i.legenda))
  }

  filhos.push(
    h1('7. Pontos para validação'),
    nota('Decisões tomadas no desenvolvimento que precisam da confirmação ou da correção do professor.'),
    ...numerados(pendencias[caso.id] ?? ['Nenhum ponto registrado.'], 'n3'),
  )
  return documento(`Caso clínico ${n}: revisão do simulador`, `Caso clínico ${n}, revisão do simulador`, filhos)
}

for (const caso of casos) {
  const arquivo = join(PASTA, `${caso.id}-revisao.docx`)
  writeFileSync(arquivo, await Packer.toBuffer(documentoRevisao(caso)))
  console.log(arquivo)
}
