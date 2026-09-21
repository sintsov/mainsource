import { company, emailHref, pageHref, type LegalPage } from '../config'

const policies = {
  privacy: {
    label: 'Privacy',
    title: 'Privacy Policy',
    intro: 'What this website does—and does not—collect, and how information shared through direct contact is handled.',
  },
  terms: {
    label: 'Website terms',
    title: 'Terms of Use',
    intro: 'A few practical terms for browsing this website and starting a conversation with us.',
  },
  'data-deletion': {
    label: 'Your information',
    title: 'Data Deletion',
    intro: 'How to request deletion of personal information you have shared with us through direct contact.',
  },
} satisfies Record<LegalPage, { label: string; title: string; intro: string }>

const legalPages: LegalPage[] = ['privacy', 'terms', 'data-deletion']

export function Legal({ page }: { page: LegalPage }) {
  const policy = policies[page]

  return (
    <main id="main-content" className="legal-page container" tabIndex={-1}>
      <a className="text-link" href={pageHref('/')}>
        Back to home
      </a>
      <p className="eyebrow">{policy.label}</p>
      <h1>{policy.title}</h1>
      <p className="legal-intro">{policy.intro}</p>

      <aside className="legal-notice" aria-label="Draft legal notice">
        <p>
          <strong>Draft legal content—not ready for public launch.</strong> The company
          details below contain placeholders. They must be completed and verified,
          the contact mailbox confirmed, and these policies reviewed by a qualified
          legal professional before public launch. This content is general website
          information, not legal advice.
        </p>
      </aside>

      <nav className="legal-nav" aria-label="Legal policies">
        {legalPages.map((legalPage) => (
          <a
            key={legalPage}
            href={pageHref(`/${legalPage}`)}
            aria-current={page === legalPage ? 'page' : undefined}
          >
            {policies[legalPage].title}
          </a>
        ))}
      </nav>

      <article className="legal-body" aria-label={policy.title}>
        {page === 'privacy' && (
          <>
            <section>
              <h2>Browsing this website</h2>
              <p>
                This is a public, static website. It has no user accounts, contact
                forms, analytics, tracking cookies or browser local storage. Fonts
                and other website assets are self-hosted alongside the site, rather
                than loaded from a third-party font service.
              </p>
              <p>
                The site is hosted on GitHub Pages. GitHub may process technical
                information, including your IP address and request logs, to deliver
                and secure its hosting service. This hosting-level processing is
                outside our direct control; a site without analytics is not a site
                without any technical data processing. See{' '}
                <a
                  className="text-link"
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                >
                  GitHub’s privacy statement
                </a>{' '}
                for its practices.
              </p>
            </section>

            <section>
              <h2>Information you choose to share</h2>
              <p>
                If you contact {company.name} by email or through an external
                service, you may provide your name, contact details, business
                information and the contents of your messages. We use that
                information to reply, understand your enquiry and conduct relevant
                business discussions. Please share only what is needed for the
                conversation, not sensitive personal information or confidential
                material that has not been requested.
              </p>
            </section>

            <section>
              <h2>Email and external services</h2>
              <p>
                Email links open your chosen email application. Where available,
                LinkedIn and WhatsApp links take you to those services only when
                clicked; this site does not embed their tracking widgets. Those
                providers handle information under their own policies, including
                information you choose to send or publish there. Their processing
                is separate from this website and from our handling of a message
                we receive.
              </p>
            </section>

            <section>
              <h2>Keeping information only as needed</h2>
              <p>
                Correspondence should be kept only for as long as needed to handle
                an enquiry, maintain a relevant business relationship or meet
                applicable legal obligations. Necessary legal or security records
                may need to be retained. The appropriate period depends on the
                information and circumstances, rather than a fixed promise for
                every message. Unnecessary personal information should be removed
                or minimized, and access limited to people and service providers
                who need it for these purposes.
              </p>
            </section>

            <section>
              <h2>Questions and requests</h2>
              <p>
                To ask about information you have shared, or request access,
                correction or deletion, email{' '}
                <a className="text-link" href={emailHref('Privacy request')}>
                  {company.email}
                </a>
                . Requests are assessed under applicable law and the relevant
                circumstances. Our{' '}
                <a className="text-link" href={pageHref('/data-deletion')}>
                  data deletion guidance
                </a>{' '}
                explains how to make a request without sending sensitive identity
                documents.
              </p>
            </section>
          </>
        )}

        {page === 'terms' && (
          <>
            <section>
              <h2>Information, not a services agreement</h2>
              <p>
                This website introduces {company.name} and the kinds of work we
                discuss with potential clients. Its content is informational, not
                a binding offer to supply services or a promise of particular
                results. Browsing the site or sending an enquiry does not create
                a services contract. Any engagement, scope, price, deliverables
                and responsibilities must be agreed separately in writing.
              </p>
            </section>

            <section>
              <h2>Lawful use and website content</h2>
              <p>
                You may browse the site and refer to its content for lawful
                personal or internal business purposes. Website text, design and
                other materials remain the intellectual property of their
                respective owners; this limited browsing permission does not
                transfer ownership or grant a general right to republish, sell
                or commercially exploit them. Any separately identified licenses
                and rights permitted by applicable law remain unaffected.
              </p>
              <p>
                Do not use the site to interfere with its availability, attempt
                unauthorized access, misrepresent an affiliation with us or
                infringe another person’s rights.
              </p>
            </section>

            <section>
              <h2>Accuracy and responsibility</h2>
              <p>
                We aim to provide useful information, but website content may
                contain errors or become outdated, and availability may be
                interrupted. Confirm any details important to a business decision
                directly with us. The site is not a substitute for professional
                advice tailored to your circumstances.
              </p>
              <p>
                Responsibility for paid services is addressed in the relevant
                written agreement and applicable law. Nothing in these website
                terms excludes or limits liability, or removes rights, where
                doing so would be unlawful.
              </p>
            </section>

            <section>
              <h2>External links and communication</h2>
              <p>
                Links to email, LinkedIn, WhatsApp or other external services are
                provided for convenience and open only when selected. We do not
                control those services or their availability, content, terms and
                privacy practices. Review their policies before sharing
                information. For this site’s handling of direct contact, read
                our{' '}
                <a className="text-link" href={pageHref('/privacy')}>
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section>
              <h2>Questions about these terms</h2>
              <p>
                Contact{' '}
                <a className="text-link" href={emailHref('Website terms enquiry')}>
                  {company.email}
                </a>{' '}
                with questions about website use or to discuss a potential
                engagement. The legal operator details below must be finalized
                before these draft terms are used publicly.
              </p>
            </section>
          </>
        )}

        {page === 'data-deletion' && (
          <>
            <section>
              <h2>No website account to delete</h2>
              <p>
                This static website has no accounts or contact forms, and does
                not use analytics, tracking cookies or browser local storage.
                There is no website profile to close. A deletion request may
                instead concern information you voluntarily sent to {company.name}
                {' '}by email or through an external communication service.
              </p>
            </section>

            <section>
              <h2>How to make a request</h2>
              <p>
                Email{' '}
                <a className="text-link" href={emailHref('Data deletion request')}>
                  {company.email}
                </a>{' '}
                with the subject “Data deletion request”.
              </p>
              <ul>
                <li>
                  Use the same email address you previously used to contact us,
                  where possible, so we can connect the request with your messages.
                </li>
                <li>
                  Identify the information you want deleted and give only enough
                  context to locate it, such as the communication channel, topic
                  or approximate date of the conversation.
                </li>
                <li>
                  Do not send passwords, passport copies, other sensitive
                  identity documents or unrelated personal information.
                </li>
              </ul>
              <p>
                If you cannot use the original address, explain that briefly.
                Any necessary verification should use proportionate information
                about the existing correspondence, rather than collecting
                sensitive identity documents.
              </p>
            </section>

            <section>
              <h2>What happens next</h2>
              <p>
                We will review the request, locate relevant information under our
                control and, if needed, ask for limited clarification before
                deleting or changing records. We will communicate the outcome
                and explain any information that cannot be deleted. Handling
                depends on the request and applicable legal requirements; this
                page does not promise a fixed response or deletion timeframe.
              </p>
            </section>

            <section>
              <h2>Records that may need to remain</h2>
              <p>
                Some information may need to be retained to meet legal
                obligations, establish or defend legal claims, or address
                legitimate security needs. If that affects your request, we can
                explain the reason and the categories of information involved.
                Any remaining records should be limited to what is necessary
                for that purpose, rather than retaining all correspondence
                without a reason.
              </p>
            </section>

            <section>
              <h2>Information held by other providers</h2>
              <p>
                GitHub Pages may hold technical hosting logs, and email,
                LinkedIn or WhatsApp providers may independently hold records
                under their own policies. We cannot directly erase information
                held solely under another provider’s control. Use that provider’s
                privacy tools or contact process for its records; you can still
                ask us to delete copies under our control. Read our{' '}
                <a className="text-link" href={pageHref('/privacy')}>
                  Privacy Policy
                </a>{' '}
                for more context.
              </p>
            </section>
          </>
        )}

        <section>
          <h2>Website operator and legal details</h2>
          <p>
            {company.name} is the website’s public-facing name. The responsible
            legal entity and registration details still need to be completed;
            the placeholders below are not verified company information.
          </p>
          <dl className="legal-details">
            <div>
              <dt>Legal entity name</dt>
              <dd>{company.legal.entityName}</dd>
            </div>
            <div>
              <dt>Registered address</dt>
              <dd>{company.legal.address}</dd>
            </div>
            <div>
              <dt>Company registration number</dt>
              <dd>{company.legal.registrationNumber}</dd>
            </div>
            <div>
              <dt>VAT / tax number</dt>
              <dd>{company.legal.taxNumber}</dd>
            </div>
            <div>
              <dt>Contact email</dt>
              <dd>
                <a className="text-link" href={emailHref('Legal enquiry')}>
                  {company.email}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </main>
  )
}
