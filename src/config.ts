export const company = {
  name: 'MainSource',
  tagline: 'AI SOFTWARE SOLUTIONS',
  location: 'Tivat, Montenegro',
  email: 'hello@mainsource.me',
  // Optional: international digits only, without + or spaces. Empty hides WhatsApp.
  whatsappNumber: '',
  legal: {
    entityName: 'MAINSOURCE DOO',
    location: 'Budva, Montenegro',
    registrationNumber: '51042801',
    taxNumber: '03448762',
  },
} as const

export const routes = {
  '/': {
    title: 'MainSource — AI & Software Solutions in Montenegro',
    description: 'Technology for real business problems. MainSource builds practical AI solutions, digital products and business tools for local and international businesses.',
  },
  '/privacy': {
    title: 'Privacy Policy — MainSource',
    description: 'How MainSource handles information voluntarily provided through direct contact, and how this static website works without analytics or tracking cookies.',
  },
  '/404': {
    title: 'Page Not Found — MainSource',
    description: 'This page could not be found. Return to MainSource to explore practical AI and software solutions for your business.',
  },
} as const

export type Route = keyof typeof routes

export const basePath = import.meta.env.BASE_URL
export const asset = (path: string) => `${basePath}${path.replace(/^\//, '')}`
export const pageHref = (path: string) => path === '/' ? basePath : `${basePath}${path.replace(/^\//, '')}/`
export const sectionHref = (id: string) => `${basePath}#${id}`
export const emailHref = (subject = 'Let’s discuss a business problem') => `mailto:${company.email}?subject=${encodeURIComponent(subject)}`

export function routeFromPath(pathname: string): Route {
  const base = basePath.replace(/\/$/, '')
  const relative = base && pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname === base ? '/' : pathname
  const path = relative.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/'
  return Object.hasOwn(routes, path) ? path as Route : '/404'
}
