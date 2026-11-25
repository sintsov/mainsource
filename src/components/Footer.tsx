import { asset, company, pageHref, type Locale } from '../config'

export function Footer({ locale }: { locale: Locale }) {
  const me = locale === 'cnr'
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href={pageHref('/', locale)} aria-label={me ? 'MainSource — početna' : 'MainSource home'}>
              <img
                src={asset('assets/mainsource-logo.webp')}
                width="2144"
                height="733"
                alt={
                  me
                    ? 'MainSource — softverska rješenja zasnovana na vještačkoj inteligenciji'
                    : 'MainSource — AI Software Solutions'
                }
                loading="lazy"
              />
            </a>
            <p>{me ? 'Praktična tehnologija. Korist za vaše poslovanje.' : 'Practical technology. Real business value.'}</p>
          </div>
          <div className="footer-company">
            <p className="footer-entity">© {company.legal.entityName}</p>
            <p>
              PIB: {company.legal.taxNumber} · {me ? 'Reg. broj:' : 'Reg. No:'} {company.legal.registrationNumber}
            </p>
            <p>{me ? 'Budva, Crna Gora' : company.legal.location}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <nav aria-label={me ? 'Pravne informacije' : 'Legal links'}>
            <a href={pageHref('/privacy', locale)}>{me ? 'Politika privatnosti' : 'Privacy Policy'}</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
