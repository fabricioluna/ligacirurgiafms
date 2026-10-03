// Lista as imagens que os casos pedem e diz quais ainda faltam em public/imagens/casos/.
// Uso: npm run imagens
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const pastaCasos = 'casos'
let faltam = 0
for (const arq of readdirSync(pastaCasos).filter((f) => /^caso-\d+\.json$/.test(f))) {
  const caso = JSON.parse(readFileSync(join(pastaCasos, arq), 'utf8'))
  const pasta = join('public', 'imagens', 'casos', caso.id.toLowerCase())
  const imagens = []
  for (const e of caso.caso.exames) if (e.imagem) imagens.push({ ...e.imagem, exame: `${e.id} ${e.nome}`, quando: 'resultado inicial' })
  for (const m of caso.caso.momentos)
    for (const u of m.atualizaExames ?? [])
      if (u.imagem) imagens.push({ ...u.imagem, exame: u.id, quando: `atualização no ${m.codigo}` })

  console.log(`\n${caso.id}: ${imagens.length} imagens (pasta ${pasta})`)
  for (const img of imagens) {
    const arquivos = img.arquivo.endsWith('/')
      ? Array.from({ length: img.quantidade ?? 0 }, (_, i) => `${img.arquivo}${String(i + 1).padStart(2, '0')}.jpg`)
      : [img.arquivo]
    const ok = arquivos.length > 0 && arquivos.every((f) => existsSync(join(pasta, f)))
    const creditoOk = img.fonte && !/a definir/i.test(img.fonte) && img.licenca && !/a definir/i.test(img.licenca)
    if (!ok || !creditoOk) faltam++
    console.log(`  ${ok ? 'OK      ' : 'FALTA   '} ${img.id}  ${img.arquivo}${img.arquivo.endsWith('/') ? ` (série, quantidade: ${img.quantidade ?? 'não definida'})` : ''}`)
    console.log(`           ${img.exame}, ${img.quando}: ${img.legenda}`)
    if (!creditoOk) console.log(`           crédito pendente: fonte "${img.fonte}", licença "${img.licenca}"`)
  }
}
console.log(faltam ? `\n${faltam} imagens com arquivo ou crédito pendente.` : '\nTodas as imagens estão no lugar, com crédito.')
