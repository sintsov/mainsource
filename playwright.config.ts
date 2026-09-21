import { defineConfig } from '@playwright/test'
import { localSiteUrl, repositoryRoot } from './tests/build-info'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    browserName: 'chromium',
    baseURL: localSiteUrl,
    headless: true,
    colorScheme: 'light',
    locale: 'en-GB',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
    },
  ],
  // Intentionally use the strict server, never Vite's SPA fallback. It reads the
  // same build manifest as the tests, including repository-prefixed deployments.
  webServer: {
    command: 'node scripts/serve.mjs',
    cwd: repositoryRoot,
    env: { PORT: '4173' },
    url: localSiteUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
})
