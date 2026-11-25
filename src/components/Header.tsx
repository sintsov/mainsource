import { useEffect, useRef } from 'react'
import { asset, sectionHref, pageHref, type Locale, type PagePath } from '../config'
import { Icon } from './Icon'

const links = [
  ['what-we-do', 'What we do', 'Šta radimo'],
  ['how-we-help', 'How we help', 'Kako pomažemo'],
  ['work', 'Success Stories', 'Priče o uspjehu'],
  ['digital-clinic', 'Digital Clinic', 'Digitalna klinika'],
  ['community', 'Community', 'Zajednica'],
  ['about', 'About', 'O nama'],
] as const
const fragments = [...links.map(([id]) => id), 'contact', 'how-we-work']

function Languages({ locale, page }: { locale: Locale; page: PagePath }) {
  return (
    <nav className="language-switch" aria-label={locale === 'en' ? 'Language' : 'Jezik'}>
      {(['en', 'cnr'] as const).map((lang) => {
        const label = lang === 'en' ? 'EN' : 'Crnogorski'
        if (lang === locale)
          return (
            <span key={lang} lang={lang} aria-current="true">
              {label}
            </span>
          )
        // The fragment is never sent to the server. CSS :target reveals the matching native link even without JS.
        return (
          <span key={lang} className="language-alternative">
            <a className={page === '/' ? 'lang-home' : undefined} href={pageHref(page, lang)} lang={lang} hrefLang={lang}>
              {label}
            </a>
            {page === '/' &&
              fragments.map((id) => (
                <a className="lang-fragment" key={id} href={sectionHref(id, lang)} lang={lang} hrefLang={lang}>
                  {label}
                </a>
              ))}
          </span>
        )
      })}
    </nav>
  )
}

export function Header({ locale, page }: { locale: Locale; page: PagePath }) {
  const me = locale === 'cnr'
  const menu = useRef<HTMLDetailsElement>(null)
  const close = () => {
    if (menu.current) menu.current.open = false
  }
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
    const media = window.matchMedia('(min-width: 1200px)')
    const onResize = () => {
      if (media.matches) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    media.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      media.removeEventListener('change', onResize)
    }
  }, [])
  const talk = me ? 'Javite nam se' : 'Let’s talk'
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={pageHref('/', locale)} aria-label={me ? 'MainSource — početna' : 'MainSource home'}>
          <img
            src={asset('assets/mainsource-logo.webp')}
            srcSet={`${asset('assets/mainsource-logo.webp')} 428w, ${asset('assets/mainsource-logo-large.webp')} 856w`}
            sizes="(max-width: 600px) 155px, 220px"
            width="2144"
            height="733"
            alt={
              me ? 'MainSource — softverska rješenja zasnovana na vještačkoj inteligenciji' : 'MainSource — AI Software Solutions'
            }
            fetchPriority="high"
          />
        </a>
        <nav className="desktop-nav" aria-label={me ? 'Glavna navigacija' : 'Main navigation'}>
          {links.map(([id, en, mn]) => (
            <a key={id} href={sectionHref(id, locale)}>
              {me ? mn : en}
            </a>
          ))}
        </nav>
        <Languages locale={locale} page={page} />
        <a className="header-contact" href={sectionHref('contact', locale)}>
          {talk}
          <Icon name="diagonal" />
        </a>
        <details className="mobile-menu" ref={menu}>
          <summary aria-label={me ? 'Otvorite ili zatvorite meni' : 'Toggle navigation menu'} aria-controls="mobile-navigation">
            <span className="menu-label">{me ? 'Meni' : 'Menu'}</span>
            <span className="menu-lines" aria-hidden="true" />
          </summary>
          <nav id="mobile-navigation" aria-label={me ? 'Mobilna navigacija' : 'Mobile navigation'}>
            {links.map(([id, en, mn]) => (
              <a key={id} href={sectionHref(id, locale)} onClick={close}>
                {me ? mn : en}
                <Icon name="arrow" />
              </a>
            ))}
            <a href={sectionHref('contact', locale)} onClick={close}>
              {talk}
              <Icon name="diagonal" />
            </a>
          </nav>
        </details>
      </div>
    </header>
  )
}
