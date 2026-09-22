import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

type PublicCompany = { email: string; location: string; legal: Record<string, string> }

function readBuildInfo(): { basePath: string; siteUrl: string; company: PublicCompany } {
  let info: { basePath?: unknown; siteUrl?: unknown; company?: PublicCompany }
  try {
    info = JSON.parse(readFileSync(new URL('../dist/site-build.json', import.meta.url), 'utf8'))
  } catch (cause) {
    throw new Error('A production build is required. Run npm run build before the tests.', { cause })
  }
  assert.equal(typeof info.basePath, 'string', 'Manifest must contain basePath')
  assert.equal(typeof info.siteUrl, 'string', 'Manifest must contain siteUrl')
  const basePath = info.basePath as string
  const siteUrl = info.siteUrl as string
  assert.match(basePath, /^\/(?:[^/?#]+\/)*$/, 'Build prefix must start and end with /')
  const publicUrl = new URL(siteUrl)
  assert.ok(['http:', 'https:'].includes(publicUrl.protocol))
  assert.equal(publicUrl.pathname, basePath, 'Public URL must include the built prefix')
  assert.equal(siteUrl, `${publicUrl.origin}${basePath}`)
  assert.ok(info.company?.email, 'Manifest must contain the current public company configuration; rebuild first')
  return { basePath, siteUrl, company: info.company }
}

export const build = readBuildInfo()
export const serverOrigin = 'http://127.0.0.1:4173'
export const localSiteUrl = `${serverOrigin}${build.basePath}`
export const localUrl = (path = '') => new URL(path, localSiteUrl).href
