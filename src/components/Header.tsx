import { useEffect, useRef } from 'react'
import { asset, sectionHref, pageHref } from '../config'
import { Icon } from './Icon'

const links = [
  ['What we do', 'what-we-do'],
  ['How we work', 'how-we-work'],
  ['Digital Clinic', 'digital-clinic'],
  ['About', 'about'],
] as const

export function Header() {
  const menu = useRef<HTMLDetailsElement>(null)
  const close = () => { if (menu.current) menu.current.open = false }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        close()
        menu.current.querySelector('summary')?.focus()
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) close()
    }
    const media = window.matchMedia('(min-width: 960px)')
    const onResize = () => { if (media.matches) close() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    media.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      media.removeEventListener('change', onResize)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={pageHref('/')} aria-label="MainSource home">
          <img src={asset('assets/mainsource-logo.webp')} srcSet={`${asset('assets/mainsource-logo.webp')} 428w, ${asset('assets/mainsource-logo-large.webp')} 856w`} sizes="(max-width: 600px) 194px, 238px" width="2144" height="733" alt="MainSource — AI Software Solutions" fetchPriority="high" />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, id]) => <a key={id} href={sectionHref(id)}>{label}</a>)}
        </nav>
        <a className="header-contact" href={sectionHref('contact')}>Let’s talk <Icon name="diagonal" /></a>
        <details className="mobile-menu" ref={menu}>
          <summary aria-label="Toggle navigation menu" aria-controls="mobile-navigation"><span className="menu-label">Menu</span><span className="menu-lines" aria-hidden="true" /></summary>
          <nav id="mobile-navigation" aria-label="Mobile navigation">
            {links.map(([label, id]) => <a key={id} href={sectionHref(id)} onClick={close}>{label}<Icon name="arrow" /></a>)}
            <a href={sectionHref('contact')} onClick={close}>Let’s talk<Icon name="diagonal" /></a>
          </nav>
        </details>
      </div>
    </header>
  )
}
