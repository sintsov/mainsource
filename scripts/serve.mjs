import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve('dist')
const { basePath } = JSON.parse(await readFile(resolve(root, 'site-build.json'), 'utf8'))
const port = Number(process.env.PORT || 4173)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

const server = createServer(async (request, response) => {
  const send = (status, body, type = 'text/html; charset=utf-8') => {
    response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
    response.end(request.method === 'HEAD' ? undefined : body)
  }
  if (!['GET', 'HEAD'].includes(request.method)) return send(405, 'Method not allowed', 'text/plain')
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`)
    const pathname = decodeURIComponent(url.pathname)
    if (basePath !== '/' && pathname === basePath.slice(0, -1)) {
      response.writeHead(301, { Location: `${basePath}${url.search}` }).end()
      return
    }
    let file = pathname.startsWith(basePath) ? resolve(root, pathname.slice(basePath.length)) : ''
    if (file !== root && !file.startsWith(`${root}${sep}`)) return send(404, await readFile(resolve(root, '404.html')))
    const info = await stat(file).catch(() => null)
    if (info?.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end()
        return
      }
      file = resolve(file, 'index.html')
    }
    const content = await readFile(file).catch(() => null)
    if (!content) return send(404, await readFile(resolve(root, '404.html')))
    send(200, content, types[extname(file)] || 'application/octet-stream')
  } catch {
    send(400, 'Bad request', 'text/plain')
  }
})
server.listen(port, '127.0.0.1', () => console.log(`Static site: http://127.0.0.1:${port}${basePath}`))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)))
