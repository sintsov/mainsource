import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Legal } from './pages/Legal'
import { pageHref, type Route, type LegalPage } from './config'

export function App({ route }: { route: Route }) {
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
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      {route === '/' ? <Home /> : route === '/404' ? (
        <main id="main-content" className="container not-found" tabIndex={-1}>
          <p className="eyebrow">404 / A little off course</p>
          <h1>This page isn’t here.</h1>
          <p>Let’s get back to the business problem.</p>
          <a className="button button-primary" href={pageHref('/')}>Back to MainSource <span aria-hidden="true">↗</span></a>
        </main>
      ) : <Legal page={route.slice(1) as LegalPage} />}
      <Footer />
    </>
  )
}
