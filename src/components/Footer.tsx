import { asset, company, pageHref } from '../config'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href={pageHref('/')} aria-label="MainSource home"><img src={asset('assets/mainsource-logo.webp')} width="2144" height="733" alt="MainSource — AI Software Solutions" loading="lazy" /></a>
            <p>Practical technology. Real business value.</p>
          </div>
          <div className="footer-company">
            <p className="footer-entity">© {company.legal.entityName}</p>
            <p>PIB: {company.legal.taxNumber} · Reg. No: {company.legal.registrationNumber}</p>
            <p>{company.legal.location}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <nav aria-label="Legal links">
            <a href={pageHref('/privacy')}>Privacy Policy</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
