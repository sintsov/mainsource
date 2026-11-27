import { company, emailHref, pageHref, type Locale } from '../config'

export function Legal({ locale }: { locale: Locale }) {
  const me = locale === 'cnr'
  const title = me ? 'Politika privatnosti' : 'Privacy Policy'
  return (
    <main id="main-content" className="legal-page container" tabIndex={-1}>
      <a className="text-link" href={pageHref('/', locale)}>
        {me ? 'Nazad na početnu' : 'Back to home'}
      </a>
      <p className="eyebrow">{me ? 'Privatnost' : 'Privacy'}</p>
      <h1>{title}</h1>
      <article className="legal-body" aria-label={title}>
        <p>
          {me
            ? 'MainSource vodi ovaj sajt radi informisanja o kompaniji.'
            : 'MainSource operates this website as an informational company website.'}
        </p>
        <p>
          {me
            ? 'Sajt nema korisničke naloge. Kôd sajta koji održava MainSource ne postavlja kolačiće za praćenje niti u pregledaču čuva vaš izbor jezika ili istoriju gledanja snimka.'
            : 'The site has no user accounts. MainSource’s website code does not set tracking cookies or save your language choice or video playback history in browser storage.'}
        </p>
        <p>
          {me
            ? 'Cloudflare isporučuje sadržaj javnog sajta. Stranice koje isporučuje uključuju skriptu Cloudflare Insights, a HTTP odgovori sadrže zaglavlja NEL i Report-To koja pregledači mogu koristiti za slanje izvještaja o mrežnim greškama.'
            : 'The public site is delivered through Cloudflare. The pages it serves include a Cloudflare Insights script and HTTP headers (NEL and Report-To) that browsers can use to send network error reports.'}
        </p>
        <p>
          {me
            ? 'Ako nam se obratite direktno mejlom, putem WhatsAppa ili drugim kanalom komunikacije, podatke koje nam dostavite možemo obraditi isključivo kako bismo odgovorili na vaš zahtjev.'
            : 'If you contact us directly by email, WhatsApp, or another communication channel, we may process the information you provide solely for the purpose of responding to your request.'}
        </p>
        <p>{me ? 'Ne prodajemo lične podatke trećim licima.' : 'We do not sell personal information to third parties.'}</p>
        <p>
          {me ? 'Za pitanja o privatnosti pišite nam na: ' : 'For privacy-related questions, contact: '}
          <a href={emailHref(me ? 'Pitanje o privatnosti' : 'Privacy request')}>{company.email}</a>
        </p>
        <p>{me ? 'Posljednje ažuriranje: novembar 2026.' : 'Last updated: November 2026'}</p>
      </article>
      <aside className="legal-player-note">
        {me
          ? 'Snimak radionice u odjeljku Zajednica reprodukuje se sa ovog sajta, bez Instagram plejera. Linkovi ka Instagramu, WhatsAppu i prodavnicama aplikacija vode na druge servise.'
          : 'The Community workshop video plays from this website, not from Instagram. Links to Instagram, WhatsApp and the app stores take you to those services.'}
      </aside>
    </main>
  )
}
