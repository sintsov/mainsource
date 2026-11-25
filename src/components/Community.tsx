import { useEffect, useState } from 'react'
import { communityReel, type Locale } from '../config'
import { Icon } from './Icon'

export function Community({ locale }: { locale: Locale }) {
  const me = locale === 'cnr'
  const [interactive, setInteractive] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setInteractive(true)
  }, [])
  return (
    <section id="community" className="community-section section-space" aria-labelledby="community-title">
      <div className="container section-heading">
        <p className="eyebrow">{me ? 'Zajednica' : 'Community'}</p>
        <div>
          <h2 id="community-title">
            {me ? 'Podrška lokalnim preduzećima u Crnoj Gori' : 'Supporting local businesses in Montenegro'}
          </h2>
          <p className="section-intro">
            {me
              ? 'U novembru 2026. godine naš osnivač je u BIC-u Tivat održao praktičnu radionicu o tome kako tehnologija i vještačka inteligencija mogu pomoći u rješavanju poslovnih problema. Vjerujemo da dijeljenjem znanja i podrškom lokalnim preduzetnicima gradimo snažniju poslovnu zajednicu.'
              : 'In November 2026, our founder led a practical workshop at BIC Tivat on solving business problems with technology and AI. We believe sharing knowledge and supporting local entrepreneurs is an important part of building a stronger business community.'}
          </p>
          <div className="community-actions">
            {interactive && (
              <button
                type="button"
                className="button reel-button"
                aria-expanded={open}
                aria-controls="reel-player"
                onClick={() => setOpen(!open)}
              >
                {open ? (me ? 'Zatvorite plejer' : 'Close player') : me ? 'Učitajte Instagram snimak' : 'Load Instagram reel'}
              </button>
            )}
            <a className="text-link" href={communityReel} rel="noreferrer">
              {me ? 'Pogledajte na Instagramu' : 'Watch on Instagram'} <Icon name="diagonal" />
            </a>
          </div>
          {interactive && (
            <p className="reel-note">
              {me
                ? 'Plejer se povezuje s Instagramom tek kada ga učitate.'
                : 'The player connects to Instagram only when you load it.'}
            </p>
          )}
          <div id="reel-player">
            {open && (
              <iframe
                className="community-player"
                src={`${communityReel}embed/`}
                title={me ? 'Radionica u BIC-u Tivat na Instagramu' : 'BIC Tivat workshop on Instagram'}
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
