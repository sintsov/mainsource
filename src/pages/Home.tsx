import { company, emailHref, sectionHref, type Locale } from '../config'
import { homeCopy } from '../home-copy'
import { Icon } from '../components/Icon'
import { VerduraFeature } from '../components/VerduraFeature'
import { Community } from '../components/Community'

export function Home({ locale }: { locale: Locale }) {
  const { hero, services, help, clinic, about, contact } = homeCopy[locale]
  const anchor = (id: string) => sectionHref(id, locale)
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-eyebrow">
          <span className="status-dot" aria-hidden="true" />
          {hero.eyebrow}
        </div>
        <div className="hero-heading-row">
          <h1 id="hero-title">
            {hero.title[0]}
            <br />
            <span>{hero.title[1]}</span>
            <br />
            {hero.title[2]}
            <span className="orange-period">.</span>
          </h1>
          <div className="hero-side-note" aria-hidden="true">
            <span className="bracket">[</span>
            <p>
              {hero.aside[0]}
              <br />
              {hero.aside[1]}
            </p>
            <span className="bracket">]</span>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="hero-description">
            <p>{hero.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={anchor('contact')}>
                {hero.discuss} <Icon name="diagonal" />
              </a>
              <a className="button button-quiet" href={anchor('what-we-do')}>
                {hero.services} <Icon name="arrow" />
              </a>
            </div>
          </div>
          <p className="hero-location">
            <Icon name="location" />
            <span>
              {hero.location}
              <br />
              {hero.reach}
            </span>
          </p>
        </div>
        <div className="hero-foot">
          {hero.fields.map((f) => (
            <span key={f}>{f}</span>
          ))}
          <a href={anchor('what-we-do')} aria-label={hero.exploreLabel}>
            <span>{hero.explore}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section id="what-we-do" className="services-section section-space" aria-labelledby="services-title">
        <div className="container">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">{services.label}</p>
            <div>
              <h2 id="services-title">
                {services.title[0]}
                <br />
                {services.title[1]}
              </h2>
              <p className="section-intro">{services.intro}</p>
            </div>
          </div>
          <div className="services-grid">
            {services.items.map(([icon, title, text, example]) => (
              <article className="service" key={icon} data-reveal>
                <span className="service-icon">
                  <Icon name={icon} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <p className="service-outcome">{example}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div id="how-we-work">
        <section id="how-we-help" className="help-section container" aria-labelledby="help-title">
          <h2 id="help-title" className="eyebrow">
            <span aria-hidden="true">02 — </span>
            {help.label}
          </h2>
          <div className="help-cards">
            {help.items.map(([icon, title, outcome]) => (
              <article key={icon}>
                <Icon name={icon} />
                <h3>{title}</h3>
                <p>{outcome}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section id="work" className="success-stories container" aria-labelledby="stories-label">
        <p id="stories-label" className="stories-label">
          {locale === 'en' ? 'Success Stories' : 'Priče o uspjehu'}
        </p>
        <VerduraFeature placement="home" locale={locale} />
      </section>

      <section id="digital-clinic" className="clinic-section section-space" aria-labelledby="clinic-title">
        <div className="container clinic-grid">
          <div className="clinic-copy" data-reveal>
            <p className="eyebrow">{clinic.label}</p>
            <h2 id="clinic-title">
              {clinic.title[0]}
              <br />
              {clinic.title[1]}
              <span className="orange-period">.</span>
            </h2>
            <p>{clinic.body}</p>
            <p className="clinic-reassurance">
              {clinic.reassurance[0]}
              <br />
              {clinic.reassurance[1]}
            </p>
            <a className="text-link" href={emailHref(clinic.subject)}>
              {clinic.ask}{' '}
              <span>
                {clinic.contact} <Icon name="diagonal" />
              </span>
            </a>
          </div>
          <div className="clinic-paper" data-reveal>
            <div className="clinic-paper-top">
              <span className="paper-label">{clinic.paper}</span>
              <Icon name="plus" />
            </div>
            <h3>
              {clinic.invitation[0]}
              <br />
              {clinic.invitation[1]}
              <br />
              <span>{clinic.invitation[2]}</span>
            </h3>
            <div className="clinic-questions">
              {clinic.questions.map((q) => (
                <p key={q}>
                  {locale === 'en' ? '“' : '„'}
                  {q}
                  {locale === 'en' ? '”' : '“'}
                </p>
              ))}
            </div>
            <div className="clinic-paper-bottom">
              <span className="status-dot" aria-hidden="true" />
              {clinic.note}
            </div>
          </div>
        </div>
      </section>
      <Community locale={locale} />
      <section id="about" className="about-section section-space" aria-labelledby="about-title">
        <div className="container about-grid">
          <div data-reveal>
            <p className="eyebrow">{about.label}</p>
            <h2 id="about-title">{about.title}</h2>
            <p className="about-signature">
              <span className="small-rule" />
              {about.signature[0]}
              <br />
              {about.signature[1]}
            </p>
          </div>
          <div className="about-copy" data-reveal>
            <p className="about-lead">{about.lead}</p>
            <p>{about.who}</p>
            <p>
              {about.founder[0]}
              <strong>{about.founder[1]}</strong>
              {about.founder[2]}
            </p>
            <p>{about.experience}</p>
            <p>{about.focus}</p>
          </div>
        </div>
      </section>
      <section id="contact" className="contact-section section-space" aria-labelledby="contact-title">
        <div className="container">
          <p className="eyebrow">{contact.label}</p>
          <div className="contact-grid">
            <div data-reveal>
              <h2 id="contact-title">
                {contact.title[0]}
                <br />
                {contact.title[1]}
                <br />
                <span>{contact.title[2]}</span>
              </h2>
            </div>
            <div className="contact-copy" data-reveal>
              <div className="contact-questions">
                {contact.questions.map((q) => (
                  <p key={q}>{q}</p>
                ))}
              </div>
              <p className="contact-invitation">{contact.invitation}</p>
              <a className="contact-email" href={emailHref(contact.subject)}>
                {company.email}
                <Icon name="diagonal" />
              </a>
              <p className="contact-note">{contact.note}</p>
              <a className="text-link whatsapp-link" href={`https://wa.me/${company.whatsappNumber}`} rel="noreferrer">
                WhatsApp · {company.whatsappDisplay}
                <Icon name="diagonal" />
              </a>
              <p className="contact-place">
                <Icon name="location" />
                <span>
                  {hero.location} · {contact.region}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
