import { pageHref } from '../config'
import { Icon } from './Icon'
import { VerduraScreens } from './VerduraScreens'

export function VerduraFeature({ placement }: { placement: 'home' | 'standalone' }) {
  const onHome = placement === 'home'
  const Heading = onHome ? 'h2' : 'h1'

  return (
    <article className="case-feature" aria-labelledby="verdura-title">
      <header className="case-heading">
        <p className="eyebrow">Local retail · Digital product · AI-assisted development</p>
        <Heading className="case-title" id="verdura-title">Verdura online</Heading>
        <p className="case-lead">Simplifying grocery ordering for a local business.</p>
      </header>
      <VerduraScreens loading={onHome ? 'lazy' : 'eager'} />
      <div className="case-intro">
        <p>Verdura online is a working grocery ordering app for a local shop in Tivat, Montenegro. Customers browse the catalogue, fill their basket and check out for delivery, then pay on arrival.</p>
        <nav className="case-stores" aria-label="Public app listings">
          <a className="text-link" rel="noreferrer" href="https://apps.apple.com/ru/app/verdura-online/id6816469055">View on the App Store <Icon name="diagonal" /></a>
          <a className="text-link" rel="noreferrer" href="https://play.google.com/store/apps/details?id=online.verdura.app">View on Google Play <Icon name="diagonal" /></a>
        </nav>
      </div>
      <div className="case-foot">
        <p className="case-goal">The goal wasn't to transform the entire business. It was to make ordering easier for customers while keeping the process familiar for the shop owners.</p>
        {onHome && <a className="text-link" href={pageHref('/work/verdura')}>Project permalink <Icon name="arrow" /></a>}
      </div>
    </article>
  )
}
