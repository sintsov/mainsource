import type { Locale } from '../config'
import { Icon } from './Icon'
import { VerduraScreens } from './VerduraScreens'

export function VerduraFeature({ placement, locale }: { placement: 'home' | 'standalone'; locale: Locale }) {
  const onHome = placement === 'home',
    me = locale === 'cnr'
  const Heading = onHome ? 'h3' : 'h1'
  return (
    <article className="case-feature" aria-labelledby="verdura-title">
      <header className="case-heading">
        <p className="eyebrow">
          {me
            ? 'Lokalna trgovina · Digitalni proizvod · Razvoj uz pomoć vještačke inteligencije'
            : 'Local retail · Digital product · AI-assisted development'}
        </p>
        <Heading className="case-title" id="verdura-title">
          Verdura online
        </Heading>
        <p className="case-lead">
          {me
            ? 'Jednostavnije naručivanje namirnica iz lokalne prodavnice.'
            : 'Simplifying grocery ordering for a local business.'}
        </p>
      </header>
      <VerduraScreens loading={onHome ? 'lazy' : 'eager'} locale={locale} />
      <div className="case-intro">
        <p>
          {me
            ? 'Verdura online je aplikacija za naručivanje namirnica iz lokalne prodavnice u Tivtu. Kupci pregledaju katalog, dodaju proizvode u korpu, dogovore dostavu i plate pri preuzimanju.'
            : 'Verdura online is a working grocery ordering app for a local shop in Tivat, Montenegro. Customers browse the catalogue, fill their basket and check out for delivery, then pay on arrival.'}
        </p>
        <nav className="case-stores" aria-label={me ? 'Prodavnice aplikacija' : 'Public app listings'}>
          <a className="text-link" rel="noreferrer" href="https://apps.apple.com/ru/app/verdura-online/id6816469055">
            {me ? 'Pogledajte na App Store-u' : 'View on the App Store'} <Icon name="diagonal" />
          </a>
          <a className="text-link" rel="noreferrer" href="https://play.google.com/store/apps/details?id=online.verdura.app">
            {me ? 'Pogledajte na Google Play-u' : 'View on Google Play'} <Icon name="diagonal" />
          </a>
        </nav>
      </div>
      <div className="case-foot">
        <p className="case-goal">
          {me
            ? 'Cilj nije bio da promijenimo poslovanje iz korijena. Željeli smo da kupcima olakšamo naručivanje, a da vlasnici prodavnice nastave da rade na način koji im je poznat.'
            : "The goal wasn't to transform the entire business. It was to make ordering easier for customers while keeping the process familiar for the shop owners."}
        </p>
      </div>
    </article>
  )
}
