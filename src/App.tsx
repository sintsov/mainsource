import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Legal } from './pages/Legal'
import { Verdura } from './pages/Verdura'
import { localeOf, pageOf, pageHref, type Route } from './config'

const pages = { '/': Home, '/work/verdura': Verdura, '/privacy': Legal }

export function App({ route }: { route: Route }) {
  const locale = localeOf(route), page = pageOf(route), me = locale === 'cnr'
  const Page = page === '/404' ? null : pages[page]
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12 })
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [route])

  return (
    <>
      <a className="skip-link" href="#main-content">{me ? 'Pređite na sadržaj' : 'Skip to content'}</a>
      <Header locale={locale} page={page} />
      {Page ? <Page locale={locale} /> : (
        <main id="main-content" className="container not-found" tabIndex={-1}>
          <p className="eyebrow">{me ? '404 / Pogrešna adresa' : '404 / A little off course'}</p>
          <h1>{me ? 'Ova stranica ne postoji.' : 'This page isn’t here.'}</h1>
          <p>{me ? 'Vratimo se vašem poslovnom izazovu.' : 'Let’s get back to the business problem.'}</p>
          <a className="button button-primary" href={pageHref('/',locale)}>{me ? 'Nazad na početnu' : 'Back to MainSource'} <span aria-hidden="true">↗</span></a>
        </main>
      )}
      <Footer locale={locale} />
    </>
  )
}
