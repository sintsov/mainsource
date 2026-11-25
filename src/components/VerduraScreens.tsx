import { asset, type Locale } from '../config'

const screens = [
  {
    name: 'catalogue',
    alt: 'Verdura online demo catalogue with product search, categories and produce.',
    cnrAlt: 'Probni katalog u aplikaciji Verdura online: pretraga, kategorije i namirnice.',
    enlarge: 'Uvećajte prikaz kataloga',
  },
  {
    name: 'basket',
    alt: 'Verdura online demo basket with groceries, a delivery total and payment on arrival.',
    cnrAlt: 'Probna korpa u aplikaciji Verdura online: namirnice, cijena dostave i plaćanje pri preuzimanju.',
    enlarge: 'Uvećajte prikaz korpe',
  },
] as const

export function VerduraScreens({ loading, locale }: { loading: 'lazy' | 'eager'; locale: Locale }) {
  const me = locale === 'cnr'
  return (
    <figure className="verdura-art">
      <div className="verdura-stage">
        {screens.map((s) => {
          const small = asset(`assets/verdura-${s.name}-375.webp`),
            large = asset(`assets/verdura-${s.name}-750.webp`)
          return (
            <a
              key={s.name}
              className="verdura-phone"
              href={large}
              aria-label={me ? s.enlarge : `Enlarge the Verdura online ${s.name} screen`}
            >
              <img
                src={small}
                srcSet={`${small} 375w, ${large} 750w`}
                sizes="(max-width: 720px) 38vw, (max-width: 1100px) 20vw, 236px"
                width="375"
                height="764"
                alt={me ? s.cnrAlt : s.alt}
                loading={loading}
              />
            </a>
          )
        })}
      </div>
      <figcaption>
        {me ? 'Probni prikazi na engleskom · Cijene su ilustrativne' : 'Demo screens · Illustrative prices'}
        <span>{me ? 'Odaberite prikaz za uvećanje.' : 'Select a screen to enlarge.'}</span>
      </figcaption>
    </figure>
  )
}
