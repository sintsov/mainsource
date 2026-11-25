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
            ? 'Ne koristimo korisničke naloge, analitiku, reklamne kolačiće ni tehnologije za praćenje i ne prikupljamo lične podatke putem ovog sajta.'
            : 'We do not use user accounts, analytics, advertising cookies, or tracking technologies, and we do not collect personal information through this website.'}
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
        <p>{me ? 'Posljednje ažuriranje: septembar 2026.' : 'Last updated: September 2026'}</p>
      </article>
      <aside className="legal-player-note">
        {me
          ? 'Opcioni Instagram plejer u odjeljku Zajednica uspostavlja vezu s Instagramom samo ako odaberete da učitate snimak.'
          : 'The optional Instagram player in Community connects to Instagram only if you choose to load the reel.'}
      </aside>
    </main>
  )
}
