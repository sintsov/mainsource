import { asset, company, pageHref } from '../config'
import { Icon } from './Icon'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href={pageHref('/')} aria-label="MainSource home"><img src={asset('assets/mainsource-logo.webp')} width="2144" height="733" alt="MainSource — AI Software Solutions" loading="lazy" /></a>
            <p>Practical technology. Real business value.</p>
          </div>
          <div className="footer-location"><Icon name="location" /><div><strong>{company.location}</strong><p>Local roots. International outlook.</p></div></div>
        </div>
        <div className="footer-bottom">
          <p>© MainSource. All rights reserved.</p>
          <nav aria-label="Legal and social links">
            <a href={pageHref('/privacy')}>Privacy Policy</a>
            <a href={pageHref('/terms')}>Terms of Use</a>
            <a href={pageHref('/data-deletion')}>Data Deletion</a>
            {company.linkedInUrl ? <a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer">LinkedIn <span className="sr-only">(opens in a new tab)</span><Icon name="diagonal" /></a> : <span className="social-placeholder">LinkedIn <span>(coming soon)</span></span>}
          </nav>
        </div>
        <details className="company-details">
          <summary>Company information <span>— details pending</span></summary>
          <dl>
            <div><dt>Legal entity</dt><dd>{company.legal.entityName}</dd></div>
            <div><dt>Registered address</dt><dd>{company.legal.address}</dd></div>
            <div><dt>Registration number</dt><dd>{company.legal.registrationNumber}</dd></div>
            <div><dt>VAT / tax number</dt><dd>{company.legal.taxNumber}</dd></div>
          </dl>
        </details>
      </div>
    </footer>
  )
}
