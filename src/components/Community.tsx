import { asset, communityReel, type Locale } from '../config'
import { Icon } from './Icon'

export function Community({ locale }: { locale: Locale }) {
  const me = locale === 'cnr'
  const [heading, country] = me
    ? ['Podrška lokalnim preduzećima u', 'Crnoj Gori']
    : ['Supporting local businesses in', 'Montenegro']
  return (
    <section id="community" className="community-section section-space" aria-labelledby="community-title">
      <div className="container community-layout">
        <div className="community-copy">
          <p className="eyebrow">{me ? 'Zajednica' : 'Community'}</p>
          <h2 id="community-title">
            {heading} <span className="community-country">{country}</span>
          </h2>
          <p className="section-intro">
            {me
              ? 'U novembru 2026. godine naš osnivač je u BIC-u Tivat održao praktičnu radionicu o tome kako tehnologija i vještačka inteligencija mogu pomoći u rješavanju poslovnih problema. Vjerujemo da dijeljenjem znanja i podrškom lokalnim preduzetnicima gradimo snažniju poslovnu zajednicu.'
              : 'In November 2026, our founder led a practical workshop at BIC Tivat on solving business problems with technology and AI. We believe sharing knowledge and supporting local entrepreneurs is an important part of building a stronger business community.'}
          </p>
          <a className="text-link" href={communityReel} rel="noreferrer">
            {me ? 'Pogledajte na Instagramu' : 'Watch on Instagram'} <Icon name="diagonal" />
          </a>
        </div>
        <video
          className="community-player"
          aria-label={me ? 'Snimak radionice Digitalna klinika u Tivtu' : 'Digital Clinic workshop recap in Tivat'}
          controls playsInline preload="none" width="720" height="1280"
          poster={asset('assets/digital-clinic-tivat-poster.webp')}
          src={asset('assets/digital-clinic-tivat.mp4')}
        >
          <track kind="captions" srcLang="en" label="English" src={asset('assets/digital-clinic-en.vtt')} />
          <track kind="captions" srcLang="cnr" label="Crnogorski" src={asset('assets/digital-clinic-cnr.vtt')} />
          {me ? 'Video nije podržan u ovom pregledaču.' : 'This browser does not support video playback.'}
        </video>
      </div>
    </section>
  )
}
