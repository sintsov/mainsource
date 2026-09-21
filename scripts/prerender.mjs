import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { loadEnv } from 'vite'
import { render, routes, basePath, company } from '../.server/entry-server.js'

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const site = new URL(env.SITE_URL || 'https://mainsource.me')
if (!['https:', 'http:'].includes(site.protocol) || site.pathname !== '/' || site.search || site.hash || site.username || site.password) {
  throw new Error('SITE_URL must be a public http(s) origin without a path, query or credentials. Set BASE_PATH separately.')
}
const siteUrl = `${site.origin}${basePath}`
const publicUrl = (route) => `${siteUrl}${route === '/' ? '' : `${route.slice(1)}/`}`
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const out = resolve('dist')
const template = await readFile(join(out, 'index.html'), 'utf8')
const fonts = (await readdir(join(out, 'assets'))).filter((file) => file.endsWith('.woff2'))
if (!template.includes('<!--app-html-->') || !/<!--site-head-->[\s\S]*?<!--\/site-head-->/.test(template)) {
  throw new Error('The built template is missing prerender markers.')
}

for (const [route, meta] of Object.entries(routes)) {
  const is404 = route === '/404'
  const canonical = publicUrl(route)
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    ...fonts.map((font) => `<link rel="preload" href="${escapeHtml(`${basePath}assets/${font}`)}" as="font" type="font/woff2" crossorigin />`),
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${is404 ? 'noindex, follow' : 'index, follow'}" />`,
    ...(!is404 ? [
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta property="og:site_name" content="MainSource" />',
      '<meta property="og:locale" content="en_GB" />',
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
      `<meta property="og:image" content="${escapeHtml(`${siteUrl}og-image.png`)}" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      '<meta property="og:image:alt" content="MainSource — AI Software Solutions" />',
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(`${siteUrl}og-image.png`)}" />`,
    ] : []),
    ...(route === '/' ? [`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Organization', name: 'MainSource',
      url: siteUrl, logo: `${siteUrl}assets/mainsource-logo-large.webp`,
      description: meta.description, address: { '@type': 'PostalAddress', addressCountry: 'ME' },
    }).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ')

  const html = template.replace(/<!--site-head-->[\s\S]*?<!--\/site-head-->/, () => head)
    .replace('<!--app-html-->', () => render(route))
    .replace('<div id="root">', `<div id="root" data-route="${route}">`)
  const file = is404 ? join(out, '404.html') : join(out, route.slice(1), 'index.html')
  await mkdir(resolve(file, '..'), { recursive: true })
  await writeFile(file, html)
  console.log(`Prerendered ${route}`)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(routes).filter((route) => route !== '/404').map((route) => `  <url><loc>${escapeHtml(publicUrl(route))}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile(join(out, 'sitemap.xml'), sitemap)
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`)
await writeFile(join(out, '.nojekyll'), '')
await writeFile(join(out, 'site-build.json'), `${JSON.stringify({ basePath, siteUrl, company }, null, 2)}\n`)
if (env.CUSTOM_DOMAIN) {
  const hostname = env.CUSTOM_DOMAIN.trim()
  if (!/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}$/i.test(hostname) || hostname !== site.hostname || basePath !== '/') {
    throw new Error('CUSTOM_DOMAIN must match the SITE_URL hostname and use BASE_PATH=/.')
  }
  await writeFile(join(out, 'CNAME'), `${hostname}\n`)
}
await rm(resolve('.server'), { recursive: true, force: true })
console.log(`Static website ready: ${siteUrl}`)
