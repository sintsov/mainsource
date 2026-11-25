import { Icon } from '../components/Icon'
import { VerduraFeature } from '../components/VerduraFeature'
import { sectionHref, type Locale } from '../config'

export function Verdura({ locale }: { locale: Locale }) {
  return (
    <main id="main-content" className="case-page container" tabIndex={-1}>
      <a className="text-link case-back" href={sectionHref('work', locale)}>
        <Icon name="arrow" />
        {locale === 'en' ? 'Back to Success Stories' : 'Nazad na priče o uspjehu'}
      </a>
      <VerduraFeature placement="standalone" locale={locale} />
    </main>
  )
}
