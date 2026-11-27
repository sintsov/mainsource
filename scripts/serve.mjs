import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve('dist')
const { basePath } = JSON.parse(await readFile(resolve(root, 'site-build.json'), 'utf8'))
const port = Number(process.env.PORT || 4173)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8' }

// Stream local films (including single byte ranges for native seeking) without buffering the full file.
function sendVideo(request, response, file, size) {
  const headers = { 'Content-Type': types['.mp4'], 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  const range = request.method === 'GET' && /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? '')
  let start = 0, end = size - 1
  if (range) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]))
    end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
    if (!Number.isSafeInteger(start) || start > end) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}`, 'Content-Length': 0 }).end()
      return
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`
  }
  response.writeHead(range ? 206 : 200, { ...headers, 'Content-Length': Math.max(0, end - start + 1) })
  if (request.method === 'HEAD' || size === 0) return response.end()
  const stream = createReadStream(file, { start, end })
  response.on('close', () => stream.destroy())
  stream.on('error', () => response.destroy()).pipe(response)
}

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
    if (info?.isFile() && extname(file) === '.mp4') return sendVideo(request, response, file, info.size)
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
