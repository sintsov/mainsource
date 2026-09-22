# MainSource website

A static company website built with React 19, TypeScript, Vite 8 and Tailwind CSS 4. Manrope and DM Sans are self-hosted; the supplied MainSource logo is the source for generated web assets.

Public website: **https://mainsource.me/**. Changes in this working copy reach the public site only after a successful GitHub Pages deployment.

## Local setup

Use **Node.js 24** (see `.nvmrc`) and npm. The package requires Node.js **22.12 or newer**. Run commands from this directory; shell examples use Bash/zsh syntax.

```sh
nvm use                         # if you use nvm; install Node 24 first if needed
npm ci
cp .env.example .env             # optional local configuration; do not overwrite an existing .env
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173/`. The `predev` hook regenerates logo assets before starting the development server.

Development mode is for editing. To inspect the actual static output, including direct legal-page requests and real 404 responses:

```sh
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/` (or the configured path prefix). Preview serves `dist/` using `scripts/serve.mjs`; it is **not** an SPA fallback server. Use `PORT=4174 npm run preview` if needed. Rebuild after edits; preview does not rebuild automatically. Do not open `dist/index.html` through `file://`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact dependency versions in `package-lock.json`. |
| `npm run dev` | Generate assets, then start Vite with hot reload. |
| `npm run assets` | Regenerate WebP logos, icons and the social preview from the original PNG. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm run build` | Type-check, generate assets, build client/server bundles and prerender the static site into `dist/`. |
| `npm run preview` | Serve the existing static build on localhost, with directory indexes and 404 handling. |
| `npm run test:static` | Run static-output tests against the existing build. |
| `npm run test:e2e` | Run Playwright browser tests against the built site. |
| `npm run check` | Build, then run static and browser tests; requires Playwright Chromium. |

Install the browser once before running browser tests or the complete check:

```sh
npx playwright install chromium
npm run check
```

The tests read public contact/legal configuration from the generated `dist/site-build.json` and verify agreed copy against `tests/site-fixtures.json`. If you deliberately change published company records, policy text, page titles, headings, section IDs or email subject wording, update the corresponding content expectations in that fixture. The manifest contains only already-public website configuration; never add secrets to `src/config.ts`.

On Linux/CI, `npx playwright install --with-deps chromium` also installs browser system dependencies. The workflow does this automatically. Automated checks are not a substitute for manual review of copy, accessibility, contact details or legal obligations; no production performance score is claimed.

## How the site works

The build renders real HTML for each page, with page-specific titles, descriptions, canonical URLs and social metadata. React hydrates that HTML for small enhancements. Navigation uses ordinary links rather than a client-side router; main content and legal pages remain available without JavaScript.

```text
src/config.ts                 Company/contact/legal values, route metadata, URL helpers
src/pages/Home.tsx            Homepage copy and sections
src/pages/Legal.tsx           Privacy Policy text and last-updated date
src/components/              Header, footer and inline icons
src/styles.css               Typography, design tokens and responsive styles
src/fonts.css                Local Latin variable-font definitions
src/entry-client.tsx          Stylesheet imports and browser hydration
src/entry-server.tsx          Build-time React rendering
scripts/generate-assets.mjs   Derived logo, icon and social assets
scripts/prerender.mjs         HTML, SEO files and optional CNAME generation
scripts/serve.mjs             Strict local static preview server
.github/workflows/deploy.yml  Test/build/deploy pipeline
mainsource-logo.png           Original supplied artwork
public/                      Static assets copied into the build
```

Production output includes:

- `dist/index.html` → `/`
- `dist/privacy/index.html` → `/privacy/`
- `dist/404.html` → the custom missing-page response
- Bundled CSS, JavaScript, self-hosted fonts and generated images
- `sitemap.xml`, `robots.txt`, `.nojekyll` and `site-build.json`
- `CNAME` only when `CUSTOM_DOMAIN` is set

Only the homepage and Privacy Policy are public content routes. The removed `/terms/` and `/data-deletion/` URLs return 404 and are excluded from the sitemap. The footer has no social link or placeholder.

All routes and asset links incorporate `BASE_PATH`. The temporary `.server/` bundle is used only during prerendering and removed afterward. Publish **only `dist/`**; no Node.js server is needed in production. Never edit generated files in `dist/` as the next build replaces them.

There is no backend, contact form, account system, analytics, tracking cookie or browser-storage feature. Email links open the visitor’s email application. GitHub Pages may still process technical hosting information such as IP addresses and request logs; “no analytics” does not mean “no data processing.”

## Edit content and contact details

Most operational values live in **`src/config.ts`**:

| Value | What to set |
| --- | --- |
| `company.email` | `hello@mainsource.me`; updates contact and Privacy Policy email links. |
| `company.whatsappNumber` | Optional international-format digits only, including country code, without `+`, spaces or punctuation. An empty string hides WhatsApp. |
| `company.location` | `Tivat, Montenegro`; displayed as “Based in Tivat, Montenegro” in Hero, About and Contact, including on mobile. |
| `company.legal` | Footer records: `MAINSOURCE DOO`, `PIB: 03448762`, `Reg. No: 51042801`, and `Budva, Montenegro`. The footer location is intentionally separate from the operating location in Tivat; no street address is implied. |
| `routes` | Page titles and descriptions used by prerendering. |

Edit the homepage’s services, process, workshop and company copy in `src/pages/Home.tsx`. Update navigation in `src/components/Header.tsx`, footer content in `src/components/Footer.tsx`, and visual styles in `src/styles.css`. If rebranding, also review hard-coded brand text in components and `scripts/prerender.mjs`; changing `company.name` alone is not a complete rebrand.

### Privacy Policy and company records

`src/pages/Legal.tsx` contains the supplied Privacy Policy, with “Last updated: September 2026”. It describes an informational website without accounts, analytics, advertising cookies or tracking, and direct-contact processing solely to respond to requests. The visible company records are maintained in `src/config.ts`; there are no draft notices or company-detail placeholders.

Keep the policy, last-updated date and company records accurate when business practices change. This implementation is not a legal compliance certification.

If you add forms, analytics, embedded third-party services or other data collection later, revisit the implementation and policies before release. Do not publish sensitive company information or secrets in configuration files.

## Logo, icons and fonts

The root **`mainsource-logo.png` is the original source and is not modified by the asset generator**. Complete-logo derivatives are resized and encoded, not redrawn or distorted. Keep the original white-backed artwork on a white surface.

`npm run assets` writes:

| Output | Size/use |
| --- | --- |
| `public/assets/mainsource-logo.webp` | 428 px wide web logo |
| `public/assets/mainsource-logo-large.webp` | 856 px wide web logo |
| `public/favicon-32.png` | 32 × 32 favicon |
| `public/favicon.ico` | ICO containing the 32 px icon |
| `public/apple-touch-icon.png` | 180 × 180 Apple icon |
| `public/og-image.png` | 1200 × 630 social-sharing image |

Icons use a crop of the existing mascot, not a newly invented mark. To make an intentional, approved logo change, replace the source artwork and review `scripts/generate-assets.mjs`: its mascot crop coordinates depend on the supplied image. Check intrinsic image dimensions in the header/footer if the aspect ratio changes. Regenerate, rebuild and inspect all sizes; do not hand-edit generated derivatives.

Fonts are loaded from `@fontsource-variable/manrope` and `@fontsource-variable/dm-sans` via `src/fonts.css`, then bundled locally. The build preloads the Latin variable-font files and includes their full license notices in `public/licenses/` (copied to `dist/licenses/`). There are no Google Fonts runtime requests. Both fonts use the **SIL Open Font License 1.1**. After `npm ci`, the full copyright and license notices are available at:

- `node_modules/@fontsource-variable/manrope/LICENSE`
- `node_modules/@fontsource-variable/dm-sans/LICENSE`

Preserve the applicable copyright/license notices when redistributing font files. Runtime packages are React, React DOM and these two font packages; development dependencies, including Vite, Tailwind, TypeScript, Sharp, Playwright and axe-core, are listed in `package.json`, with resolved versions in `package-lock.json`.

## Public URL configuration

Use `.env` locally (ignored by Git) or environment variables when building. Changes require a new build. Shell environment variables override `.env` values. These values are public build configuration, **not secrets**.

| Variable | Meaning |
| --- | --- |
| `SITE_URL` | Public origin only, e.g. `https://OWNER.github.io` or `https://example.com`. No repository path, query, fragment or credentials. Default: `https://mainsource.me`. Use HTTPS for production. |
| `BASE_PATH` | `/` for a custom domain/account site, or `/REPOSITORY/` for a GitHub project site. Use a slash-delimited path prefix, not a full URL. Default: `/`. |
| `CUSTOM_DOMAIN` | Optional bare hostname, without scheme or path. Must match the `SITE_URL` hostname and requires `BASE_PATH=/`. Emits `dist/CNAME`; it does not configure DNS or GitHub Pages. Leave empty for the normal `github.io` URL. |

Examples:

| Deployment | `SITE_URL` | `BASE_PATH` | `CUSTOM_DOMAIN` |
| --- | --- | --- | --- |
| Account site | `https://OWNER.github.io` | `/` | empty |
| Project site | `https://OWNER.github.io` | `/REPOSITORY/` | empty |
| Owned custom domain | `https://example.com` | `/` | `example.com` |

`OWNER`, `REPOSITORY` and `example.com` are examples to replace. The origin and base path determine canonical URLs, the sitemap and social-image URLs as well as navigation/assets.

Test a GitHub project-path build before deploying (the empty domain overrides a local `.env` custom domain):

```sh
SITE_URL=https://OWNER.github.io BASE_PATH=/REPOSITORY/ CUSTOM_DOMAIN= npm run check
npm run preview
# Open http://127.0.0.1:4173/REPOSITORY/
```

Also visit `/REPOSITORY/privacy/`. Confirm `/REPOSITORY/terms/`, `/REPOSITORY/data-deletion/` and an unknown URL return 404. Restore your intended variables and rebuild afterward.

**Robots caveat:** on a project site, the generated file lives at `/REPOSITORY/robots.txt`. Crawlers use the origin-root `/robots.txt`; a project-level file is not authoritative for the entire account host. If you control the account-root site, configure its root robots file and sitemap references as appropriate, or use an owned custom domain. Do not rely on a robots file to keep drafts private.

## Deploy to GitHub Pages

The workflow uses the official `configure-pages`, `upload-pages-artifact` and `deploy-pages` actions. It installs dependencies and Chromium, runs `npm run check`, uploads `dist/`, and deploys **only after the build/test job succeeds**.

1. Complete the launch checks below before exposing the site publicly.
2. Use the existing GitHub repository for this project, or create one when deploying a separate copy.
3. In the repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
4. For a standard Pages URL, leave repository URL variables unset. `actions/configure-pages` supplies the actual public origin and base path automatically.
5. If overriding the destination, set repository **Settings → Secrets and variables → Actions → Variables**: `SITE_URL`, `BASE_PATH`, and optional `CUSTOM_DOMAIN`. Keep them consistent with the actual Pages settings; these are variables, not secrets. Local `.env` is not uploaded to CI.
6. Push to `main`, or run **Actions → Deploy static site to GitHub Pages → Run workflow**. If your default branch has another name, update `on.push.branches` in `.github/workflows/deploy.yml`.
7. Inspect the successful workflow/deployment URL, then test the live pages and assets. Editing repository variables alone does not deploy: run the workflow again.

Review staged files before committing; do not commit credentials. `node_modules/`, `.env`, `dist/` and temporary/test output are ignored. Commit the source, original logo, workflow, manifest and lockfile.

### Custom domain and HTTPS

The configured public domain is `mainsource.me`. The steps below also apply if you migrate to another domain you control.

1. Follow GitHub’s [domain ownership verification instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages), adding the account/organization-specific TXT record GitHub provides. Keep the verification record as instructed.
2. **Set the chosen hostname in the repository’s Settings → Pages → Custom domain before pointing DNS to GitHub Pages.** For custom Actions deployments, the repository setting is essential; a generated `CNAME` file alone is not a substitute.
3. Set repository variables to the same destination. For an apex domain such as `example.com`: `SITE_URL=https://example.com`, `BASE_PATH=/`, `CUSTOM_DOMAIN=example.com`. If `www.example.com` is the preferred hostname, use it in both hostname variables instead.
4. At your DNS provider, follow GitHub’s [current custom-domain DNS instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). For the apex, use the currently documented A/AAAA records or a supported ALIAS/ANAME configuration; do not copy guessed or outdated IP addresses. For `www`, use the documented CNAME target `OWNER.github.io`, without a scheme or repository path. Configure both apex and `www` if you want GitHub’s supported redirect between them, and avoid wildcard records.
5. Rerun the deployment workflow. Wait for DNS validation and certificate issuance, then enable **Enforce HTTPS** when available in Pages settings. DNS propagation and certificate availability may take time; do not treat a pending certificate as a successful launch.
6. Check the preferred hostname, the alternate-host redirect if configured, HTTPS, all direct page URLs, images, canonical URLs and the sitemap. Verify the domain’s email DNS separately; website DNS does not create `hello@…` or configure mail delivery.

## Production launch checklist

- [ ] Confirm rights to the supplied logo and accuracy of the public company/service/experience statements.
- [ ] Verify domain ownership, intended canonical hostname and all three build variables.
- [ ] Confirm the contact mailbox is active, monitored and receiving mail; test `mailto:` links with a configured email client.
- [ ] Enable WhatsApp only for an approved working number; leave it empty to hide the button.
- [ ] Review the current Privacy Policy, update date and company records for accuracy, keeping the Tivat operating location separate from the Budva footer location.
- [ ] Run `npm ci`, install Playwright Chromium, and run `npm run check` for the intended deployment path.
- [ ] Inspect desktop and mobile layouts, keyboard focus/navigation, mobile menu, reduced-motion behavior, and content with JavaScript disabled.
- [ ] Test direct requests and refreshes for Privacy Policy, plus removed and unknown URLs returning the custom 404 instead of the homepage.
- [ ] Confirm the deployed title/description/canonical metadata, social image, self-hosted fonts, favicon, sitemap and appropriate root robots configuration.
- [ ] Enable GitHub Pages via Actions, review the successful deployment, validate DNS/HTTPS if applicable, and repeat smoke checks on the actual public URL.

Successful builds/tests do not verify domain ownership, email delivery, legal compliance or real-world performance.
