export const company = {
  name: 'MainSource',
  tagline: 'AI SOFTWARE SOLUTIONS',
  location: 'Tivat, Montenegro',
  email: 'hello@mainsource.me',
  whatsappNumber: '38268142091',
  whatsappDisplay: '+382 68 142 091',
  legal: { entityName: 'MAINSOURCE DOO', location: 'Budva, Montenegro', registrationNumber: '51042801', taxNumber: '03448762' },
} as const

export type Locale = 'en' | 'cnr'
export type PagePath = '/' | '/work/verdura' | '/privacy' | '/404'
export const routes = {
  '/': {
    title: 'MainSource — AI & Software Solutions in Montenegro',
    description:
      'Technology for real business problems. MainSource builds practical AI solutions, digital products and business tools for local and international businesses.',
  },
  '/work/verdura': {
    title: 'Verdura online — Grocery Ordering App | MainSource',
    description:
      'Simplifying grocery ordering for a local business. Explore Verdura online, a grocery delivery app for a shop in Tivat, and view its public app listings.',
  },
  '/privacy': {
    title: 'Privacy Policy — MainSource',
    description:
      'How MainSource handles direct contact, what the website stores in your browser, and how Cloudflare delivers the public site.',
  },
  '/404': {
    title: 'Page Not Found — MainSource',
    description:
      'This page could not be found. Return to MainSource to explore practical AI and software solutions for your business.',
  },
  '/cnr': {
    title: 'MainSource — Softver i vještačka inteligencija u Crnoj Gori',
    description:
      'MainSource u Tivtu razvija digitalne proizvode, poslovne alate i rješenja zasnovana na vještačkoj inteligenciji za preduzeća u Crnoj Gori i inostranstvu.',
  },
  '/cnr/work/verdura': {
    title: 'Verdura online — Aplikacija za naručivanje namirnica | MainSource',
    description:
      'Kako smo jednoj prodavnici u Tivtu pojednostavili naručivanje namirnica. Pogledajte aplikaciju Verdura online i pronađite je u prodavnicama aplikacija.',
  },
  '/cnr/privacy': {
    title: 'Politika privatnosti — MainSource',
    description:
      'Kako MainSource postupa kada nam se obratite, šta sajt čuva u pregledaču i kako Cloudflare isporučuje sadržaj javnog sajta.',
  },
  '/cnr/404': {
    title: 'Stranica nije pronađena — MainSource',
    description:
      'Stranica koju tražite nije pronađena. Vratite se na početnu stranicu i saznajte kako vam MainSource može pomoći.',
  },
} as const
export type Route = keyof typeof routes
export const localeOf = (route: Route): Locale => (route === '/cnr' || route.startsWith('/cnr/') ? 'cnr' : 'en')
export const pageOf = (route: Route): PagePath => (route.replace(/^\/cnr(?=\/|$)/, '') || '/') as PagePath
export const localizedRoute = (page: PagePath, locale: Locale): Route =>
  locale === 'en' ? page : page === '/' ? '/cnr' : `/cnr${page}`
export const basePath = import.meta.env.BASE_URL
export const asset = (path: string) => `${basePath}${path.replace(/^\//, '')}`
export function pageHref(page: PagePath, locale: Locale = 'en') {
  const path = localizedRoute(page, locale).slice(1)
  return basePath + (page === '/404' ? `${path}.html` : path ? `${path}/` : '')
}
export const sectionHref = (id: string, locale: Locale = 'en') => `${pageHref('/', locale)}#${id}`
export const emailHref = (subject = 'Let’s discuss a business problem') =>
  `mailto:${company.email}?subject=${encodeURIComponent(subject)}`
export const communityReel = 'https://www.instagram.com/reel/Df9137kqNFz/'

export function routeFromPath(pathname: string): Route {
  const base = basePath.replace(/\/$/, '')
  const relative = base && pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname === base ? '/' : pathname
  const path =
    relative
      .replace(/\/index\.html$/, '/')
      .replace(/\/404\.html$/, '/404')
      .replace(/\/+$/, '') || '/'
  return Object.hasOwn(routes, path) ? (path as Route) : path.startsWith('/cnr/') ? '/cnr/404' : '/404'
}
