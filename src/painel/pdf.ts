// Extrai o texto de um PDF no próprio navegador (pdf.js). Só o texto vai para o servidor,
// o que mantém o pedido pequeno. PDF escaneado (só imagem) não tem texto e é recusado.

export async function textoDoPdf(arquivo: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const { default: worker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise
  const paginas: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const conteudo = await (await doc.getPage(i)).getTextContent()
    let linha = ''
    const linhas: string[] = []
    for (const item of conteudo.items) {
      if (!('str' in item)) continue
      linha += item.str
      if (item.hasEOL) {
        linhas.push(linha)
        linha = ''
      }
    }
    if (linha) linhas.push(linha)
    paginas.push(linhas.join('\n'))
  }
  return paginas.join('\n\n')
}
