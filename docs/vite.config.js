import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const mime = {
  '.js':   'application/javascript; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
}

function staticMiddleware(dir, prefix) {
  return (req, res, next) => {
    if (!req.url.startsWith(prefix)) return next()
    const rel = req.url.slice(prefix.length).split('?')[0] || '/'
    const abs = path.join(dir, rel)
    const ext = path.extname(abs)
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      res.setHeader('Content-Type', mime[ext] || 'text/plain; charset=utf-8')
      fs.createReadStream(abs).pipe(res)
    } else {
      next()
    }
  }
}

export default defineConfig({
  base: '/tinybubble/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [{
    name: 'serve-repo-statics',
    configureServer(server) {
      // Serve examples/ and src/ from repo root during dev so example links work
      server.middlewares.use(staticMiddleware(path.join(repoRoot, 'examples'), '/tinybubble/examples'))
      server.middlewares.use(staticMiddleware(path.join(repoRoot, 'src'), '/tinybubble/src'))
    },
  }],
})
