import { company, emailHref, pageHref } from '../config'

export function Legal() {
  return (
    <main id="main-content" className="legal-page container" tabIndex={-1}>
      <a className="text-link" href={pageHref('/')}>Back to home</a>
      <p className="eyebrow">Privacy</p>
      <h1>Privacy Policy</h1>
      <article className="legal-body" aria-label="Privacy Policy">
        <p>MainSource operates this website as an informational company website.</p>
        <p>We do not use user accounts, analytics, advertising cookies, or tracking technologies, and we do not collect personal information through this website.</p>
        <p>If you contact us directly by email, WhatsApp, or another communication channel, we may process the information you provide solely for the purpose of responding to your request.</p>
        <p>We do not sell personal information to third parties.</p>
        <p>For privacy-related questions, contact: <a href={emailHref('Privacy request')}>{company.email}</a></p>
        <p>Last updated: September 2026</p>
      </article>
    </main>
  )
}
