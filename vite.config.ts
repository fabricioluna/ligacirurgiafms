import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// No computador, as funções de /api rodam dentro do próprio `npm run dev`,
// lendo a chave do arquivo .env.local. Na Vercel, elas rodam como funções serverless.
function apiLocal(): Plugin {
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const nome = req.url?.match(/^\/api\/([a-z]+)(?:\?|$)/)?.[1]
        if (!nome) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${nome}.ts`)
          const corpo = await new Promise<string>((ok) => {
            let dados = ''
            req.on('data', (p) => (dados += p))
            req.on('end', () => ok(dados))
          })
          const cabecalhos = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') cabecalhos.set(k, v)
          const resposta: Response = await mod.default.fetch(
            new Request(`http://localhost${req.url}`, {
              method: req.method,
              headers: cabecalhos,
              body: req.method === 'GET' || req.method === 'HEAD' ? undefined : corpo,
            }),
          )
          res.statusCode = resposta.status
          resposta.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await resposta.text())
        } catch (e) {
          server.ssrFixStacktrace(e as Error)
          next(e)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Só as variáveis do servidor; nada disso vai para o navegador (não usam o prefixo VITE_).
  const env = loadEnv(mode, process.cwd(), '')
  const doServidor = ['GEMINI_API_KEY', 'GEMINI_MODELO', 'GEMINI_MODELO_EXTRACAO', 'IA_SIMULADA', 'FIREBASE_SERVICE_ACCOUNT', 'PAINEL_CODIGO']
  for (const k of doServidor) if (env[k] && !process.env[k]) process.env[k] = env[k]
  return { plugins: [react(), tailwindcss(), apiLocal()] }
})
