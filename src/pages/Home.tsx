import { company, emailHref, sectionHref } from '../config'
import { Icon } from '../components/Icon'

const services = [
  { icon: 'automation', title: 'AI & Automation', text: 'Identify repetitive or inefficient business processes and use AI and automation to improve them.', example: 'Less repetitive work. More time for what matters.' },
  { icon: 'product', title: 'Digital Products', text: 'Design and build web applications, mobile applications and customer-facing digital experiences.', example: 'Turn a good idea into something people use.' },
  { icon: 'tools', title: 'Business Tools', text: 'Create practical internal tools that simplify operations, data management and everyday workflows.', example: 'Make the everyday work work better.' },
  { icon: 'strategy', title: 'Technology Strategy', text: 'Understand where technology can create value and define a practical path from an idea to implementation.', example: 'Find the right next step. Not just the latest thing.' },
] as const

const steps = [
  { number: '01', title: 'Understand', text: 'Start from the real business problem and understand the current process.', note: 'The right questions first.' },
  { number: '02', title: 'Explore', text: 'Identify possible digital, automation or AI solutions and evaluate which ones actually make sense.', note: 'A practical way forward.' },
  { number: '03', title: 'Build', text: 'Create a prototype, proof of concept or production solution and validate it with real users.', note: 'Something that works in the real world.' },
]

export function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-eyebrow"><span className="status-dot" aria-hidden="true" /><span>Independent thinking. Practical technology.</span></div>
        <div className="hero-heading-row">
          <h1 id="hero-title">Technology for<br /><span>real business</span><br />problems<span className="orange-period">.</span></h1>
          <div className="hero-side-note" aria-hidden="true"><span className="bracket">[</span><p>Business first.<br />Technology second.</p><span className="bracket">]</span></div>
        </div>
        <div className="hero-bottom">
          <div className="hero-description">
            <p>We help businesses identify where technology, automation and AI can create real value — and turn those opportunities into working digital products.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={sectionHref('contact')}>Discuss your business problem <Icon name="diagonal" /></a>
              <a className="button button-quiet" href={sectionHref('what-we-do')}>What we do <Icon name="arrow" /></a>
            </div>
          </div>
          <p className="hero-location"><Icon name="location" /><span>Based in {company.location}<br />Working with businesses everywhere.</span></p>
        </div>
        <div className="hero-foot"><span>AI & automation</span><span>Digital products</span><span>Business tools</span><a href={sectionHref('what-we-do')} aria-label="Explore what we do"><span>Explore</span><span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="what-we-do" className="services-section section-space" aria-labelledby="services-title">
        <div className="container">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">What we do</p>
            <div><h2 id="services-title">Good technology.<br />A better way to work.</h2><p className="section-intro">Practical digital products and AI solutions that improve your processes, customer experience and operational efficiency.</p></div>
          </div>
          <div className="services-grid">
            {services.map((service) => <article className="service" key={service.title} data-reveal>
              <span className="service-icon"><Icon name={service.icon} /></span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <p className="service-outcome">{service.example}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="how-we-work" className="process-section section-space" aria-labelledby="process-title">
        <div className="container">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">How we work</p>
            <div><h2 id="process-title">The problem comes first.<br /><span>The solution follows.</span></h2><p className="section-intro">A clear, collaborative path from “what if” to something useful.</p></div>
          </div>
          <ol className="process-grid">
            {steps.map((step) => <li key={step.number} data-reveal>
              <div className="step-top"><span className="step-number">{step.number}</span><Icon name="arrow" /></div>
              <h3>{step.title}</h3><p>{step.text}</p><span className="step-note">{step.note}</span>
            </li>)}
          </ol>
          <blockquote className="process-quote" data-reveal><span className="quote-mark" aria-hidden="true">“</span><p>We don’t build technology for the sake of technology. We start with a real business problem and see where technology can actually help.</p></blockquote>
        </div>
      </section>

      <section id="digital-clinic" className="clinic-section section-space" aria-labelledby="clinic-title">
        <div className="container clinic-grid">
          <div className="clinic-copy" data-reveal>
            <p className="eyebrow">Workshops & Digital Clinic</p>
            <h2 id="clinic-title">Technology for<br />Local Business<span className="orange-period">.</span></h2>
            <p>We organize practical workshops and Digital Clinic sessions where entrepreneurs bring real business challenges and explore how digital products, automation and AI can help solve them.</p>
            <p className="clinic-reassurance">No technical background is required.<br />The discussion starts with the business problem.</p>
            <a className="text-link" href={emailHref('Workshop or Digital Clinic enquiry')}>Interested in a workshop or Digital Clinic? <span>Get in touch <Icon name="diagonal" /></span></a>
          </div>
          <div className="clinic-paper" data-reveal>
            <div className="clinic-paper-top"><span className="paper-label">THE DIGITAL CLINIC</span><Icon name="plus" /></div>
            <h3>Bring a challenge.<br />Leave with<br /><span>a direction.</span></h3>
            <div className="clinic-questions"><p>“Can we spend less time on admin?”</p><p>“Could this process be simpler?”</p><p>“Where could AI actually help?”</p></div>
            <div className="clinic-paper-bottom"><span className="status-dot" aria-hidden="true" /><span>Real questions. Practical conversations.</span></div>
          </div>
        </div>
      </section>

      <section id="about" className="about-section section-space" aria-labelledby="about-title">
        <div className="container about-grid">
          <div data-reveal><p className="eyebrow">About MainSource</p><h2 id="about-title">Experience from engineering to business transformation.</h2><p className="about-signature"><span className="small-rule" />Built on experience.<br />Focused on what’s next.</p></div>
          <div className="about-copy" data-reveal>
            <p className="about-lead">We start with the business problem, not the technology.</p>
            <p>Based in {company.location}, MainSource is a technology company focused on AI, software products, and business process automation.</p>
            <p>The company is founded by an engineering leader with more than <strong>20 years of experience</strong> in software development, architecture, digital products, and technology management.</p>
            <p>This experience includes building and scaling engineering teams, creating technology platforms from the ground up, improving software delivery and infrastructure, and using technology to support business growth.</p>
            <p>Today, MainSource focuses on practical AI adoption, digital products, and automation — starting from real business problems and turning them into simple, effective technology solutions.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section section-space" aria-labelledby="contact-title">
        <div className="container">
          <p className="eyebrow">Start a conversation</p>
          <div className="contact-grid">
            <div data-reveal><h2 id="contact-title">Let’s talk about<br />your business<br /><span>problem.</span></h2></div>
            <div className="contact-copy" data-reveal>
              <div className="contact-questions"><p>Have a manual process that takes too much time?</p><p>An idea for a digital product?</p><p>Wondering where AI could actually help your business?</p></div>
              <p className="contact-invitation">Let’s talk.</p>
              <a className="contact-email" href={emailHref()}>{company.email}<Icon name="diagonal" /></a>
              <p className="contact-note">A simple email is a good place to start.</p>
              {company.whatsappNumber && <a className="text-link" href={`https://wa.me/${company.whatsappNumber}`} target="_blank" rel="noopener noreferrer">Contact on WhatsApp <span className="sr-only">(opens in a new tab)</span><Icon name="diagonal" /></a>}
              <p className="contact-place"><Icon name="location" /><span>Based in {company.location} · Local & international projects</span></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
