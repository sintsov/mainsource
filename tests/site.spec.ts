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

const legalPages = fixtures.pages.filter((page) => !['/', '/404'].includes(page.route))
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) < 960

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
    if (expected.route !== '/404') {
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
    await expect(page.locator('.footer-company p')).toHaveText(fixtures.footer)
    await expect(page.getByRole('navigation', { name: 'Legal links' }).getByRole('link')).toHaveCount(1)
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
