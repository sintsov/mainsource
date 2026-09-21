import assert from 'node:assert/strict'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const here = dirname(fileURLToPath(import.meta.url))
const dist = resolve(here, '../dist')
const fixtures = JSON.parse(readFileSync(join(here, 'site-fixtures.json'), 'utf8'))
assert.ok(existsSync(join(dist, 'site-build.json')), 'Run npm run build before testing static output')
const { basePath, siteUrl, company } = JSON.parse(readFileSync(join(dist, 'site-build.json'), 'utf8'))
const origin = new URL(siteUrl).origin
const documents = fixtures.pages.map((page) => ({
  ...page,
  html: readFileSync(join(dist, page.file), 'utf8'),
  url: new URL(page.path, siteUrl),
}))
const publicPages = documents.filter((page) => page.route !== '/404')

function decode(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10))
    return entities[entity.toLowerCase()] ?? match
  })
}

function text(html) {
  return decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
}

// A small quoted-attribute scanner is sufficient for generated HTML and avoids
// introducing a DOM/browser dependency into the Node-only build checks.
function tags(html, name) {
  return [...html.matchAll(/<([a-z][\w:-]*)\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi)]
    .filter((match) => !name || match[1].toLowerCase() === name)
    .map((match) => {
      const attributes = {}
      for (const attr of match[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
        attributes[attr[1].toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '')
      }
      return { name: match[1].toLowerCase(), attributes }
    })
}

function meta(html, key) {
  const matches = tags(html, 'meta').filter(({ attributes }) => attributes.name === key || attributes.property === key)
  assert.equal(matches.length, 1, `Expected one ${key} meta tag`)
  assert.ok(matches[0].attributes.content, `${key} must not be empty`)
  return matches[0].attributes.content
}

function canonical(html) {
  return tags(html, 'link').filter(({ attributes }) => attributes.rel === 'canonical').map(({ attributes }) => attributes.href)
}

function localFile(value, fromUrl, label) {
  const url = new URL(value, fromUrl)
  if (!['http:', 'https:'].includes(url.protocol)) return null
  if (url.origin !== origin) return null
  assert.ok(url.pathname.startsWith(basePath), `${label}: ${url.href} escapes build prefix ${basePath}`)
  const relative = decodeURIComponent(url.pathname.slice(basePath.length))
  let file = resolve(dist, relative)
  assert.ok(file === dist || file.startsWith(`${dist}${sep}`), `${label}: path escapes dist`)
  assert.ok(existsSync(file), `${label}: missing ${url.pathname} (${file})`)
  if (statSync(file).isDirectory()) file = join(file, 'index.html')
  assert.ok(existsSync(file), `${label}: missing directory index ${file}`)
  assert.ok(realpathSync(file).startsWith(`${realpathSync(dist)}${sep}`), `${label}: dependency escapes dist through a symlink`)
  assert.ok(statSync(file).isFile() && statSync(file).size > 0, `${label}: empty or non-file dependency ${file}`)
  if (url.hash && extname(file) === '.html') {
    const id = decodeURIComponent(url.hash.slice(1))
    assert.ok(tags(readFileSync(file, 'utf8')).some(({ attributes }) => attributes.id === id), `${label}: missing fragment ${url.hash} in ${file}`)
  }
  return { file, url }
}

test('deployment manifest describes a normalized public origin and built prefix', () => {
  assert.match(basePath, /^\/(?:[^/?#]+\/)*$/)
  const site = new URL(siteUrl)
  assert.ok(['https:', 'http:'].includes(site.protocol))
  assert.equal(siteUrl, `${site.origin}${basePath}`)
  assert.equal(site.pathname, basePath)
  assert.equal(site.search + site.hash + site.username + site.password, '')
  assert.ok(existsSync(join(dist, '.nojekyll')), 'GitHub Pages must serve the build without Jekyll')
  if (existsSync(join(dist, 'CNAME'))) {
    assert.equal(basePath, '/', 'A custom domain must use the root build')
    assert.equal(readFileSync(join(dist, 'CNAME'), 'utf8').trim(), site.hostname)
  }
})

for (const page of documents) {
  test(`${page.route}: complete prerendered content and explicit company placeholders`, () => {
    assert.match(page.html, /^<!doctype html>/i)
    assert.equal(tags(page.html, 'html')[0]?.attributes.lang, 'en')
    assert.equal(tags(page.html, 'main').length, 1)
    assert.equal(tags(page.html, 'h1').length, 1)
    assert.ok(tags(page.html, 'div').some(({ attributes }) => attributes.id === 'root' && attributes['data-route'] === page.route))
    const h1 = page.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
    assert.equal(text(h1?.[1] ?? ''), page.heading)
    const content = text(page.html)
    for (const expected of page.content) assert.ok(content.includes(expected), `Missing prerendered content: ${expected}`)
    for (const detail of Object.values(company.legal)) assert.ok(content.includes(detail), `Missing configured legal detail: ${detail}`)
    if (Object.values(company.legal).some((detail) => detail.startsWith('[')) && page.route !== '/' && page.route !== '/404') {
      assert.ok(content.includes('Draft legal content—not ready for public launch.'))
      assert.ok(content.includes('placeholders below are not verified company information.'))
    }
    // Legal placeholders are intentional. Build/template placeholders are not.
    assert.doesNotMatch(page.html, /<!--\s*(?:app-html|\/?site-head)\s*-->|%[A-Z][A-Z_]+%|__VITE_[\w_]*__|\[object Object\]/)
    assert.equal(tags(page.html, 'form').length, 0, 'The site must not invent a contact form')
    const socialLinks = tags(page.html, 'a').filter(({ attributes }) => attributes.href === company.linkedInUrl)
    if (company.linkedInUrl) {
      assert.equal(socialLinks.length, 1, 'The configured LinkedIn profile must be linked')
    } else {
      assert.ok(content.includes('LinkedIn (coming soon)'))
      assert.ok(!tags(page.html, 'a').some(({ attributes }) => /linkedin\.com/i.test(attributes.href ?? '')), 'Unconfigured LinkedIn must not be a fake clickable profile')
    }
    const mailLinks = tags(page.html, 'a').map(({ attributes }) => attributes.href).filter((href) => href?.startsWith('mailto:'))
    const subjects = mailLinks.map((href) => {
      const address = new URL(href)
      assert.equal(address.pathname, company.email, `Unexpected contact address in ${page.route}`)
      assert.equal(address.hash, '')
      return address.searchParams.get('subject')
    })
    assert.deepEqual([...new Set(subjects)].sort(), [...page.subjects].sort())
  })

  test(`${page.route}: correct page-specific search and social metadata`, () => {
    const titles = [...page.html.matchAll(/<title>([\s\S]*?)<\/title>/gi)]
    assert.equal(titles.length, 1)
    assert.equal(decode(titles[0][1]), page.title)
    assert.ok(meta(page.html, 'description').length > 50)
    assert.match(meta(page.html, 'viewport'), /width=device-width/)
    if (page.route === '/404') {
      assert.match(meta(page.html, 'robots'), /\bnoindex\b/)
      assert.deepEqual(canonical(page.html), [], 'Do not advertise an error page as canonical')
      assert.equal(tags(page.html, 'meta').filter(({ attributes }) => attributes.property?.startsWith('og:')).length, 0)
      return
    }
    assert.deepEqual(canonical(page.html), [page.url.href])
    assert.equal(meta(page.html, 'robots'), 'index, follow')
    assert.equal(meta(page.html, 'og:type'), 'website')
    assert.equal(meta(page.html, 'og:site_name'), 'MainSource')
    assert.equal(meta(page.html, 'og:title'), page.title)
    assert.equal(meta(page.html, 'og:description'), meta(page.html, 'description'))
    assert.equal(meta(page.html, 'og:url'), page.url.href)
    const image = meta(page.html, 'og:image')
    assert.equal(image, `${siteUrl}og-image.png`)
    assert.ok(localFile(image, page.url, 'Open Graph image'))
    assert.equal(meta(page.html, 'og:image:width'), '1200')
    assert.equal(meta(page.html, 'og:image:height'), '630')
    assert.ok(meta(page.html, 'og:image:alt').includes('MainSource'))
    assert.equal(meta(page.html, 'twitter:card'), 'summary_large_image')
    assert.equal(meta(page.html, 'twitter:title'), page.title)
    assert.equal(meta(page.html, 'twitter:description'), meta(page.html, 'description'))
    assert.equal(meta(page.html, 'twitter:image'), image)
  })
}

test('every route has unique titles, descriptions, canonical addresses and OG addresses', () => {
  for (const [label, values] of [
    ['title', documents.map((page) => page.title)],
    ['description', documents.map((page) => meta(page.html, 'description'))],
    ['canonical', publicPages.map((page) => canonical(page.html)[0])],
    ['OG title', publicPages.map((page) => meta(page.html, 'og:title'))],
    ['OG URL', publicPages.map((page) => meta(page.html, 'og:url'))],
  ]) assert.equal(new Set(values).size, values.length, `Duplicate ${label}`)
})

test('organization metadata uses the deployment addresses and no invented street address', () => {
  const home = documents.find((page) => page.route === '/')
  const scripts = [...home.html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1)
  const organization = JSON.parse(scripts[0][1])
  assert.equal(organization['@context'], 'https://schema.org')
  assert.equal(organization['@type'], 'Organization')
  assert.equal(organization.name, 'MainSource')
  assert.equal(organization.url, siteUrl)
  assert.equal(organization.logo, `${siteUrl}assets/mainsource-logo-large.webp`)
  assert.deepEqual(organization.address, { '@type': 'PostalAddress', addressCountry: 'ME' })
  assert.ok(!organization.sameAs, 'Do not publish an unconfigured social profile in structured data')
  assert.ok(localFile(organization.logo, home.url, 'Organization logo'))
})

test('sitemap and robots list the actual deployment and omit the 404 page', () => {
  const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  assert.match(sitemap, /<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/)
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]))
  assert.deepEqual(locations.sort(), publicPages.map((page) => page.url.href).sort())
  assert.equal(new Set(locations).size, locations.length)
  assert.ok(!locations.includes(`${siteUrl}404/`) && !locations.includes(`${siteUrl}404.html`), 'The error page must not be indexed')
  for (const location of locations) assert.ok(localFile(location, siteUrl, 'Sitemap location'))
  const robots = readFileSync(join(dist, 'robots.txt'), 'utf8')
  assert.match(robots, /^User-agent: \*$/m)
  assert.match(robots, /^Allow: \/$/m)
  assert.deepEqual([...robots.matchAll(/^Sitemap:\s*(\S+)$/gm)].map((match) => match[1]), [`${siteUrl}sitemap.xml`])
})

test('all local links, fragments, images, scripts, CSS and transitive font/module dependencies resolve inside dist', () => {
  const visited = new Set()
  const queue = documents.map(({ file, url }) => ({ file: join(dist, file), url }))
  let dependencyCount = 0
  function dependency(value, fromUrl, label, resource = false) {
    if (!value) return
    const url = new URL(value, fromUrl)
    if (resource && ['http:', 'https:'].includes(url.protocol)) assert.equal(url.origin, origin, `${label}: site resources must be self-hosted`)
    const resolved = localFile(value, fromUrl, label)
    if (resolved) {
      dependencyCount++
      if (['.html', '.css', '.js', '.mjs', '.svg'].includes(extname(resolved.file))) queue.push(resolved)
    }
  }
  while (queue.length) {
    const { file, url } = queue.shift()
    if (visited.has(file)) continue
    visited.add(file)
    const source = readFileSync(file, 'utf8')
    if (['.html', '.svg'].includes(extname(file))) {
      for (const { name, attributes } of tags(source)) {
        for (const attribute of ['href', 'src', 'poster', 'xlink:href']) {
          dependency(attributes[attribute], url, `${file}: ${name}[${attribute}]`, name !== 'a' && attributes.rel !== 'canonical')
        }
        for (const attribute of ['srcset', 'imagesrcset']) {
          if (attributes[attribute]) for (const candidate of attributes[attribute].split(',')) {
            dependency(candidate.trim().split(/\s+/)[0], url, `${file}: ${attribute}`, true)
          }
        }
      }
    }
    if (extname(file) === '.css') {
      for (const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi)) dependency(match[1] ?? match[2] ?? match[3], url, `${file}: CSS url()`, true)
      for (const match of source.matchAll(/@import\s+["']([^"']+)["']/gi)) dependency(match[1], url, `${file}: CSS import`, true)
    }
    if (['.js', '.mjs'].includes(extname(file))) {
      for (const match of source.matchAll(/(?:\b(?:import|export)\s*(?:[^"'();]*?\sfrom\s*)?|\bimport\s*\(\s*)["']([^"']+)["']/g)) {
        if (/^(?:\.?\.?\/|https?:)/.test(match[1])) dependency(match[1], url, `${file}: module import`, true)
      }
    }
  }
  assert.ok(dependencyCount > 20, 'Dependency checks must actually traverse the generated site')
  assert.ok([...visited].some((file) => file.endsWith('.css')), 'No stylesheet was checked')
  assert.ok([...visited].some((file) => file.endsWith('.js')), 'No browser bundle was checked')
})
