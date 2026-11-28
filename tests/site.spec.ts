import AxeBuilder from '@axe-core/playwright'
import { test as base, expect, type Page, type TestInfo } from '@playwright/test'
import { resolve } from 'node:path'
import { build, localUrl, serverOrigin } from './build-info'
import fixtures from './site-fixtures.json' with { type: 'json' }

type RuntimeChecks = { expected404s: Set<string> }
const test = base.extend<{ runtimeChecks: RuntimeChecks }>({
  runtimeChecks: [async ({ page }, use, testInfo) => {
    const expected404s = new Set<string>()
    const problems: string[] = []
    const isExpected404 = (url: string) => expected404s.has(url.split('#')[0])
    page.on('pageerror', (error) => problems.push(`Uncaught exception: ${error.stack ?? error.message}`))
    page.on('console', (message) => {
      if (message.type() !== 'error' && !/hydrati|server.rendered|did not match/i.test(message.text())) return
      // Chromium logs a console error for an intentional 404 document. Failed
      // assets are never exempted: the response listener below checks them too.
      if (/^Failed to load resource:.*\b404\b/.test(message.text()) &&
          (isExpected404(message.location().url) || (!message.location().url && expected404s.size > 0))) return
      problems.push(`Console ${message.type()}: ${message.text()} (${message.location().url})`)
    })
    page.on('requestfailed', (request) => problems.push(`Request failed: ${request.url()} (${request.failure()?.errorText})`))
    page.on('response', (response) => {
      if (response.status() < 400) return
      if (response.status() === 404 && response.request().resourceType() === 'document' && isExpected404(response.url())) return
      problems.push(`HTTP ${response.status()}: ${response.request().resourceType()} ${response.url()}`)
    })
    await use({ expected404s })
    if (!page.isClosed()) await page.waitForLoadState('load')
    if (problems.length) {
      await testInfo.attach('browser-runtime-errors', { body: problems.join('\n'), contentType: 'text/plain' })
    }
    expect(problems, 'No console, hydration, uncaught exception or resource errors').toEqual([])
  }, { auto: true }],
})

const legalPages = fixtures.pages.filter((page) => page.route === '/privacy')
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1200

function headingPattern(heading: string) {
  // JSX <br> and adjacent spans need not introduce whitespace in textContent.
  return new RegExp(heading.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'))
}

async function visit(page: Page, path = '') {
  const response = await page.goto(localUrl(path), { waitUntil: 'load' })
  expect(response?.status(), `Direct request for ${path || '/'} must be served from disk`).toBe(200)
  await expect(page.getByRole('main')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

async function assertNoOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width
    const offenders = [...document.querySelectorAll('body *')].flatMap((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.position === 'fixed') return []
      return rect.right > width + 1 || rect.left < -1
        ? [`${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${String(element.className).replace(/\s+/g, '.')} (${Math.round(rect.left)}…${Math.round(rect.right)})`]
        : []
    })
    return { overflow, offenders: offenders.slice(0, 12) }
  })
  expect(metrics.overflow, `Horizontal overflow: ${metrics.offenders.join(', ')}`).toBeLessThanOrEqual(1)
}

async function loadedImages(page: Page) {
  // Force an instant scroll so Playwright does not wait for an in-flight smooth
  // anchor scroll to stabilize in a JavaScript-disabled browser context.
  for (const image of await page.locator('img[loading="lazy"]').all()) {
    await image.evaluate((img) => img.scrollIntoView({ behavior: 'instant', block: 'center' }))
  }
  await page.getByRole('contentinfo').evaluate((footer) => footer.scrollIntoView({ behavior: 'instant', block: 'end' }))
  await expect.poll(() => page.locator('img').evaluateAll((images) => images
    .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
    .map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src)), {
    message: 'Every rendered image, including the footer logo, must load',
  }).toEqual([])
}

async function assertAnchorDestination(page: Page, id: string) {
  await expect(page).toHaveURL(localUrl(`#${id}`))
  await expect(page.locator(`#${id}`)).toBeInViewport()
  await expect.poll(async () => page.locator(`#${id}`).evaluate((target) => {
    const top = target.getBoundingClientRect().top
    const headerBottom = document.querySelector('header')!.getBoundingClientRect().bottom
    return top >= headerBottom - 2 && top < window.innerHeight / 2
  }), { message: `${id} must settle below the sticky header, not underneath it` }).toBe(true)
}

async function assertAccessible(page: Page, testInfo: TestInfo, attachment: string) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const violations = results.violations.map(({ id, impact, help, helpUrl, nodes }) => ({
    id, impact, help, helpUrl,
    nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }))
  if (violations.length) await testInfo.attach(attachment, { body: JSON.stringify(violations, null, 2), contentType: 'application/json' })
  expect(violations, 'WCAG 2 A/AA and 2.1 A/AA, including color contrast (no rule exclusions)').toEqual([])
}

for (const expected of fixtures.pages) {
  test(`${expected.route}: direct static entry, metadata, contacts and layout`, async ({ page }) => {
    await visit(page, expected.path)
    await expect(page).toHaveTitle(expected.title)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(headingPattern(expected.heading))
    await expect(page.locator('#root')).toHaveAttribute('data-route', expected.route)
    for (const content of expected.content) {
      await expect(page.getByRole('main')).toContainText(headingPattern(content))
    }
    if (!expected.route.endsWith('/404')) {
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${build.siteUrl}${expected.path}`)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${build.siteUrl}${expected.path}`)
    } else {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
    }
    const mailto = await page.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
    const subjects = mailto.map((href) => {
      const url = new URL(href)
      expect(url.pathname).toBe(build.company.email)
      return url.searchParams.get('subject')
    })
    expect([...new Set(subjects)].sort()).toEqual([...expected.subjects].sort())
    await expect(page.getByRole('link', { name: /linkedin|terms of use|data deletion/i })).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('lang', expected.locale)
    await expect(page.locator('.footer-company p')).toHaveText(expected.locale === 'en' ? fixtures.footer : fixtures.footerCnr)
    await expect(page.getByRole('navigation', { name: expected.locale === 'en' ? 'Legal links' : 'Pravne informacije' }).getByRole('link')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).not.toContainText('Tivat')
    await expect(page.locator('.legal-notice, .company-details')).toHaveCount(0)
    if (expected.route === '/') {
      for (const selector of ['.hero-location', '#about', '.contact-place']) {
        await expect(page.locator(selector)).toBeVisible()
        await expect(page.locator(selector)).toContainText('Based in Tivat, Montenegro')
      }
      await expect(page.getByRole('main')).not.toContainText('Budva')
    }
    if (expected.route === '/privacy') await expect(page.locator('.legal-body p')).toHaveText(expected.content)
    await loadedImages(page)
    await assertNoOverflow(page)
  })

  test(`${expected.route}: WCAG accessibility`, async ({ page }, testInfo) => {
    await visit(page, expected.path)
    await loadedImages(page)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await assertAccessible(page, testInfo, 'wcag-violations')
  })
}

test('unknown nested URLs return a real 404 with a working home link', async ({ page, request, runtimeChecks }) => {
  for (const path of ['not-a-real-route/deep/link/', 'privacy/not-a-page/', 'terms/', 'data-deletion/', 'terms/index.html', 'data-deletion/index.html']) {
    const url = localUrl(path)
    const response = await request.get(url)
    expect(response.status(), url).toBe(404)
    expect(await response.text()).toContain('data-route="/404"')
    expect(response.headers()['content-type']).toContain('text/html')
  }
  const missing = localUrl('not-a-real-route/deep/link/')
  runtimeChecks.expected404s.add(missing)
  const response = await page.goto(missing, { waitUntil: 'load' })
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('Page Not Found — MainSource')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page isn’t here.')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await loadedImages(page)
  await assertNoOverflow(page)
  await page.getByRole('link', { name: 'Back to MainSource' }).click()
  await expect(page).toHaveURL(localUrl())
  await expect(page.locator('#root')).toHaveAttribute('data-route', '/')

  const missingCnr = localUrl('cnr/not-a-real-route/')
  runtimeChecks.expected404s.add(missingCnr)
  expect((await page.goto(missingCnr))?.status()).toBe(404)
  await expect(page.locator('html')).toHaveAttribute('lang','cnr')
  await expect(page.getByRole('heading',{ level: 1 })).toHaveText('Ova stranica ne postoji.')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)

  if (build.basePath !== '/') {
    const outsidePrefix = await request.get(`${serverOrigin}/privacy/`)
    expect(outsidePrefix.status(), 'A prefixed build must not silently serve root-level routes').toBe(404)
  }
})

test('header navigation and hero CTAs use real, usable section anchors', async ({ page }) => {
  await visit(page)
  for (const id of fixtures.homeSections) {
    const nav = page.getByRole('navigation', { name: isPhone(page) ? 'Mobile navigation' : 'Main navigation', exact: true })
    if (isPhone(page)) await page.locator('.mobile-menu summary').click()
    const link = id === 'contact' && !isPhone(page)
      ? page.getByRole('banner').getByRole('link', { name: 'Let’s talk' })
      : nav.locator(`a[href="${build.basePath}#${id}"]`)
    await expect(link).toHaveAttribute('href', `${build.basePath}#${id}`)
    await link.click()
    await assertAnchorDestination(page, id)
    if (isPhone(page)) await expect(page.locator('.mobile-menu')).not.toHaveAttribute('open', '')
  }
  for (const [name, id] of [['What we do', 'what-we-do'], ['Discuss your business problem', 'contact']] as const) {
    const link = page.locator('.hero-actions').getByRole('link', { name, exact: true })
    await expect(link).toHaveAttribute('href', `${build.basePath}#${id}`)
    await link.click()
    await assertAnchorDestination(page, id)
  }
})

test('mobile native menu works by keyboard, Escape and outside pointer', async ({ page }) => {
  test.skip(!isPhone(page), 'Native menu is visible only below the desktop breakpoint')
  await visit(page)
  const menu = page.locator('details.mobile-menu')
  const summary = menu.locator('summary')
  await expect(summary).toHaveAttribute('aria-controls', 'mobile-navigation')
  await summary.focus()
  await page.keyboard.press('Space')
  await expect(menu).toHaveAttribute('open', '')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(menu.getByRole('link', { name: 'What we do', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).not.toHaveAttribute('open', '')
  await expect(summary).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('open', '')
  const bounds = await page.locator('#mobile-navigation').boundingBox()
  expect(bounds).not.toBeNull()
  // A noninteractive gutter below the dropdown tests outside-click dismissal,
  // rather than accidentally closing it by following a link or navigating away.
  await page.mouse.click(4, bounds!.y + bounds!.height + 12)
  await expect(menu).not.toHaveAttribute('open', '')
  await expect(page).toHaveURL(localUrl())
})

test('open mobile navigation passes the accessibility scan', async ({ page }, testInfo) => {
  test.skip(!isPhone(page), 'Desktop navigation is covered by the page scans')
  await visit(page)
  await page.locator('.mobile-menu summary').click()
  await expect(page.locator('.mobile-menu')).toHaveAttribute('open', '')
  await assertNoOverflow(page)
  await assertAccessible(page, testInfo, 'mobile-menu-wcag-violations')
})

test('the first keyboard stop is a visible skip link that bypasses the header', async ({ page }) => {
  await visit(page)
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await expect(skip).toHaveAttribute('href', '#main-content')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(localUrl('#main-content'))
  await expect(page.getByRole('main')).toBeFocused()
  // The next Tab must enter main content, never go back through the header.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('main').getByRole('link').first()).toBeFocused()
})

test('footer privacy link, return navigation and hard refresh work without routing fallback', async ({ page }) => {
  await visit(page)
  for (const legal of legalPages) {
    await page.getByRole('contentinfo').getByRole('link', { name: legal.heading, exact: true }).click()
    await page.waitForLoadState('load')
    await expect(page).toHaveURL(localUrl(legal.path))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(legal.heading)
    const response = await page.reload({ waitUntil: 'load' })
    expect(response?.status(), `Hard refresh of ${legal.path}`).toBe(200)
    await expect(page).toHaveTitle(legal.title)
    await expect(page.getByRole('navigation', { name: 'Legal links' }).getByRole('link', { name: legal.heading, exact: true }))
      .toHaveAttribute('href', `${build.basePath}${legal.path}`)
  }
  await page.getByRole('link', { name: 'Back to home', exact: true }).click()
  await expect(page).toHaveURL(localUrl())
})

test.describe('progressive enhancement without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the homepage project and its standalone permalink offer the same screens and store links', async ({ page }) => {
    await visit(page, '#work')
    const feature = page.getByRole('article', { name: 'Verdura online' })
    const assertFeature = async (level: 1 | 3) => {
      await expect(feature.getByRole('heading', { level, name: 'Verdura online' })).toBeVisible()
      for (const screen of ['catalogue', 'basket']) {
        await expect(feature.getByRole('link', { name: `Enlarge the Verdura online ${screen} screen` })).toHaveAttribute('href', `${build.basePath}assets/verdura-${screen}-750.webp`)
      }
      const listings = feature.getByRole('navigation', { name: 'Public app listings' })
      await expect(listings.getByRole('link', { name: 'View on the App Store' })).toHaveAttribute('href', 'https://apps.apple.com/ru/app/verdura-online/id6816469055')
      await expect(listings.getByRole('link', { name: 'View on Google Play' })).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=online.verdura.app')
    }
    await expect(page.locator('#work').getByRole('heading', { level: 2, name: 'Success Stories', exact: true })).toBeVisible()
    await assertFeature(3)
    // The homepage keeps its own small section H2; its feature should not be shrunk into the label grid's right column.
    const presentation = (el: Element) => {
      const style = (selector: string) => getComputedStyle(el.querySelector(selector)!)
      return [Math.round(el.getBoundingClientRect().width), getComputedStyle(el).gridTemplateAreas, getComputedStyle(el).gap,
        style('.case-title').fontSize, style('.case-lead').fontSize, style('.verdura-stage').padding]
    }
    const homePresentation = await feature.evaluate(presentation)
    await expect(page.locator('a').filter({ hasText: 'Project permalink' })).toHaveCount(0)
    await expect(page.locator(`a[href="${build.basePath}work/verdura/"]`)).toHaveCount(0)
    await visit(page, 'work/verdura/')
    expect((await page.reload())?.status()).toBe(200)
    await assertFeature(1)
    expect(await feature.evaluate(presentation)).toEqual(homePresentation)
    await page.getByRole('link', { name: 'Back to Success Stories' }).focus()
    await page.keyboard.press('Enter')
    await assertAnchorDestination(page, 'work')
  })

  test('native workshop video works without JavaScript and does not preload the MP4', async ({ page }) => {
    const media: string[] = []
    page.on('request', r => { if (r.resourceType() === 'media') media.push(r.url()) })
    await visit(page, '#community')
    const video = page.locator('#community video')
    // Avoid Chromium's animation-stability polling on a no-JS hash navigation.
    await video.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }))
    await expect(video).toHaveAttribute('controls','')
    await expect(video).toHaveAttribute('playsinline','')
    await expect(video).toHaveAttribute('preload','none')
    await expect(video).not.toHaveAttribute('autoplay','')
    expect(media).toEqual([])
    // Silence only the test element: an unavailable hardware audio clock can stall currentTime in headless Chromium.
    await expect(video).not.toHaveAttribute('muted', /.*/)
    await video.evaluate((v: HTMLVideoElement) => { v.muted = true })
    await video.focus(); await page.keyboard.press('Space')
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.25)
    expect(await video.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight])).toEqual([720, 1280])
    await page.keyboard.press('Space')
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    expect(new Set(media)).toEqual(new Set([localUrl('assets/digital-clinic-tivat.mp4')]))
    await expect(page.locator('#community a')).toHaveAttribute('href','https://www.instagram.com/reel/Df9137kqNFz/')
  })

  test('prerendered home, contact, native navigation and legal pages remain usable', async ({ page }) => {
    await visit(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(headingPattern(fixtures.pages[0].heading))
    for (const id of fixtures.homeSections) {
      await expect(page.locator(`#${id}`)).toBeVisible()
      await expect(page.locator(`#${id}`)).toContainText(/\S/)
    }
    const contact = page.locator('#contact').getByRole('link', { name: build.company.email })
    expect(new URL((await contact.getAttribute('href'))!).pathname).toBe(build.company.email)
    if (isPhone(page)) {
      const menu = page.locator('details.mobile-menu')
      await menu.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(menu).toHaveAttribute('open', '')
      await menu.getByRole('link', { name: 'What we do', exact: true }).click()
      await expect(page).toHaveURL(localUrl('#what-we-do'))
      await expect(page.locator('#what-we-do')).toBeInViewport()
      // Closing with the native summary must still work; Escape/outside-close
      // are JavaScript enhancements, not requirements in this context.
      await menu.locator('summary').click()
      await expect(menu).not.toHaveAttribute('open', '')
    } else {
      await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'What we do' }).click()
      await assertAnchorDestination(page, 'what-we-do')
    }
    await loadedImages(page)
    await assertNoOverflow(page)
    for (const legal of legalPages) {
      // Native keyboard activation avoids Chromium's animation-stability polling
      // when JavaScript is disabled and a long page must scroll to its footer.
      await page.getByRole('contentinfo').getByRole('link', { name: legal.heading, exact: true }).focus()
      await page.keyboard.press('Enter')
      await page.waitForLoadState('load')
      await expect(page).toHaveURL(localUrl(legal.path))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(legal.heading)
      expect((await page.reload())?.status()).toBe(200)
    }
  })
})

test.describe('native language links', () => {
  test.use({ javaScriptEnabled: false, locale: 'sr-Latn-ME' })
  test('English is the default and both languages keep page and section without scripts', async ({ page }) => {
    await visit(page)
    await expect(page.locator('html')).toHaveAttribute('lang','en')
    for (const path of ['#work','#community','#contact','#how-we-help','#how-we-work','privacy/','work/verdura/']) {
      // A fragment-only navigation is same-document, so it has no HTTP response.
      await page.goto(localUrl(path))
      const switchTo = page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: 'Crnogorski' })
      await expect(switchTo).toHaveAttribute('href', `${build.basePath}cnr/${path}`)
      await switchTo.focus(); await page.keyboard.press('Enter')
      await expect(page).toHaveURL(localUrl(`cnr/${path}`)); await expect(page.locator('html')).toHaveAttribute('lang','cnr')
      const back = page.getByRole('navigation', { name: 'Jezik' }).getByRole('link', { name: 'EN',exact:true })
      await expect(back).toHaveAttribute('href', `${build.basePath}${path}`)
      if (path === '#community') {
        await expect(page.locator('#community video')).toHaveAttribute('aria-label','Snimak radionice Digitalna klinika u Tivtu')
        await expect(page.locator('#community video')).toHaveAttribute('src',`${build.basePath}assets/digital-clinic-tivat.mp4`)
        await expect(page.locator('#community a')).toHaveAttribute('href','https://www.instagram.com/reel/Df9137kqNFz/')
      }
      await back.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(localUrl(path))
    }
  })
})

for (const lang of ['en','cnr'] as const) {
  test(`${lang}: shared section labels, WhatsApp icon and first-party workshop video`, async ({ page, context }) => {
    const requests: string[] = []
    const earlyMedia: string[] = []
    page.on('request', r => { if (r.url().endsWith('.mp4')) earlyMedia.push(r.url()) })
    await context.route(/^https?:\/\//, route => {
      if (new URL(route.request().url()).origin === serverOrigin) return route.continue()
      requests.push(route.request().url()); return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Offline link check</title>' })
    })
    await visit(page, lang === 'en' ? '' : 'cnr/')
    const work = page.getByRole('region', { name: lang === 'en' ? 'Success Stories' : 'Priče o uspjehu' })
    const sectionTitle = work.getByRole('heading', { level: 2, name: lang === 'en' ? 'Success Stories' : 'Priče o uspjehu', exact: true })
    await expect(sectionTitle).toBeVisible()
    const labelStyle = (el: Element) => {
      const s = getComputedStyle(el)
      return [s.fontFamily, s.fontSize, s.fontWeight, s.letterSpacing, s.lineHeight, s.textTransform, el.getBoundingClientRect().left]
    }
    const peer = await page.locator('#what-we-do .section-heading > .eyebrow').evaluate(labelStyle)
    expect(await sectionTitle.evaluate(labelStyle)).toEqual(peer)
    expect(await page.locator('#help-title').evaluate(labelStyle)).toEqual(peer)
    await expect(work.getByRole('heading',{level:3, name:'Verdura online'})).toBeVisible()
    await expect(work.locator('a[href^="https://apps.apple.com/"]')).toHaveAttribute('href','https://apps.apple.com/ru/app/verdura-online/id6816469055')
    await expect(work.locator('a[href^="https://play.google.com/"]')).toHaveAttribute('href','https://play.google.com/store/apps/details?id=online.verdura.app')
    await expect(page.locator(`a[href="${build.basePath}${lang === 'cnr' ? 'cnr/' : ''}work/verdura/"]`)).toHaveCount(0)
    await expect(page.locator('body')).not.toContainText(/Featured project|Project permalink/i)
    const help = page.locator('#how-we-work > #how-we-help')
    // Check rendered text too: the previous numeric prefix was aria-hidden.
    await expect(help.getByRole('heading', { level: 2 })).toHaveText(lang === 'en' ? 'How we help' : 'Kako pomažemo')
    await expect(help.locator('article h3')).toHaveText(lang === 'en' ? ['Advisory', 'Discovery', 'Delivery'] : ['Savjetovanje', 'Istraživanje', 'Realizacija'])
    const evidence = lang === 'en'
      ? [['costs and benefits', 'what to change first'], ['prototype on realistic examples', 'plan for the first version'], ['test it with your team', 'instructions so your team']]
      : [['prednosti i nedostatke', 'šta prvo promijeniti'], ['konkretnim primjerima isprobavamo prototip', 'plan prve verzije'], ['testiramo ga s vašim timom', 'uputstva za samostalan rad']]
    for (const [i, [activity, outcome]] of evidence.entries()) {
      const copy = help.locator('article p').nth(i)
      await expect(copy).toContainText(activity)
      await expect(copy.locator('.help-result')).toContainText(outcome)
      expect((await copy.textContent())?.match(/[^.!?]+[.!?]/g)).toHaveLength(2)
    }
    await expect(page.locator('#contact .whatsapp-link')).toHaveText(/\+382 68 142 091/)
    await expect(page.locator('#contact .whatsapp-link')).toHaveAttribute('href','https://wa.me/38268142091')
    const mark = page.locator('.whatsapp-link svg.whatsapp-mark')
    await expect(mark).toHaveAttribute('aria-hidden','true')
    expect(await mark.evaluate(el => getComputedStyle(el).color)).toBe(await page.locator('.service-icon').first().evaluate(el => getComputedStyle(el).color))
    const community = page.locator('#community')
    const heading = community.getByRole('heading', { level: 2, name: lang === 'en' ? 'Supporting local businesses in Montenegro' : 'Podrška lokalnim preduzećima u Crnoj Gori', exact: true })
    const highlight = heading.locator('span')
    await expect(highlight).toHaveText([lang === 'en' ? 'Montenegro' : 'Crnoj Gori'])
    const accent = await highlight.evaluate(el => getComputedStyle(el).color)
    expect(accent).toBe(await page.locator('.orange-period').first().evaluate(el => getComputedStyle(el).color))
    expect(await heading.evaluate(el => getComputedStyle(el).color)).not.toBe(accent)
    await expect(community.locator('details, figcaption')).toHaveCount(0)
    await expect(community).not.toContainText(/Video description|Opis snimka|Video: Biznis info centar Tivat|Snimak: Biznis info centar Tivat/)
    await expect(community.locator('a')).toHaveAttribute('href','https://www.instagram.com/reel/Df9137kqNFz/')
    await expect(page.locator('iframe')).toHaveCount(0)
    const video = community.locator('video')
    await expect(video).toHaveAccessibleName(lang === 'en' ? 'Digital Clinic workshop recap in Tivat' : 'Snimak radionice Digitalna klinika u Tivtu')
    await expect(video).not.toHaveAttribute('aria-describedby', /.+/)
    await video.scrollIntoViewIfNeeded()
    await expect(video).toHaveAttribute('poster', `${build.basePath}assets/digital-clinic-tivat-poster.webp`)
    await expect(video).toHaveAttribute('src', `${build.basePath}assets/digital-clinic-tivat.mp4`)
    await expect(video.locator('track[kind="captions"]')).toHaveCount(2)
    await expect(video.locator(`track[srclang="${lang}"]`)).toHaveAttribute('src',`${build.basePath}assets/digital-clinic-${lang}.vtt`)
    expect(await video.evaluate((v: HTMLVideoElement) => [v.paused,v.readyState,v.autoplay])).toEqual([true,0,false])
    expect(earlyMedia).toEqual([])
    expect(requests).toEqual([])
  })
}

test('local workshop film is served once with the correct type, size and seek ranges', async ({ request }) => {
  const url = localUrl('assets/digital-clinic-tivat.mp4')
  const meta = await request.head(url)
  expect(meta.status()).toBe(200)
  expect(meta.headers()['content-type']).toBe('video/mp4')
  expect(meta.headers()['accept-ranges']).toBe('bytes')
  const size = Number(meta.headers()['content-length'])
  expect(size).toBeGreaterThan(0); expect(size).toBeLessThanOrEqual(4_100_000)
  const start = await request.get(url,{ headers:{range:'bytes=0-15'} })
  expect(start.status()).toBe(206); expect(start.headers()['content-range']).toBe(`bytes 0-15/${size}`)
  const bytes = await start.body(); expect(bytes.length).toBe(16); expect(bytes.toString('ascii',4,8)).toBe('ftyp')
  const end = await request.get(url,{ headers:{range:'bytes=-10'} })
  expect(end.status()).toBe(206); expect(end.headers()['content-range']).toBe(`bytes ${size-10}-${size-1}/${size}`)
  expect((await end.body()).length).toBe(10)
  const invalid = await request.get(url,{headers:{range:`bytes=${size}-`}})
  expect(invalid.status()).toBe(416); expect(invalid.headers()['content-range']).toBe(`bytes */${size}`)
})

test('reduced motion preserves content and layout without animated reveals or smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await visit(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  expect(await page.locator('html').evaluate((html) => getComputedStyle(html).scrollBehavior)).toBe('auto')
  for (const id of fixtures.homeSections) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await expect(page.locator(`#${id}`)).toBeVisible()
  }
  const hiddenOrAnimated = await page.locator('[data-reveal]').evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element)
    return style.opacity !== '1' || style.visibility !== 'visible' || style.display === 'none' || style.animationName !== 'none' ||
      style.transitionDuration.split(',').some((duration) => parseFloat(duration) !== 0)
      ? [`${element.tagName}.${element.className}: opacity=${style.opacity}, animation=${style.animationName}, transition=${style.transitionDuration}`]
      : []
  }))
  expect(hiddenOrAnimated).toEqual([])
  await assertNoOverflow(page)
})

test('capture a representative full-page home screenshot', async ({ page }, testInfo) => {
  await visit(page)
  await loadedImages(page)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const path = resolve(testInfo.project.outputDir, `${testInfo.project.name}-home.png`)
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  await testInfo.attach(`${testInfo.project.name}-home`, { path, contentType: 'image/png' })
})
