import { asset } from '../config'

const screens = [
  { name: 'catalogue', alt: 'Verdura online demo catalogue with product search, categories and produce.' },
  { name: 'basket', alt: 'Verdura online demo basket with groceries, a delivery total and payment on arrival.' },
] as const

export function VerduraScreens({ loading }: { loading: 'lazy' | 'eager' }) {
  return (
    <figure className="verdura-art">
      <div className="verdura-stage">
        {screens.map(({ name, alt }) => {
          const small = asset(`assets/verdura-${name}-375.webp`)
          const large = asset(`assets/verdura-${name}-750.webp`)
          return (
            <a key={name} className="verdura-phone" href={large} aria-label={`Enlarge the Verdura online ${name} screen`}>
              <img src={small} srcSet={`${small} 375w, ${large} 750w`} sizes="(max-width: 720px) 38vw, (max-width: 1100px) 20vw, 236px" width="375" height="764" alt={alt} loading={loading} />
            </a>
          )
        })}
      </div>
      <figcaption>Demo screens · Illustrative prices<span>Select a screen to enlarge.</span></figcaption>
    </figure>
  )
}
