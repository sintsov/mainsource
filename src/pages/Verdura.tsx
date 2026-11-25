import { Icon } from '../components/Icon'
import { VerduraFeature } from '../components/VerduraFeature'
import { sectionHref } from '../config'

export function Verdura() {
  return (
    <main id="main-content" className="case-page container" tabIndex={-1}>
      <a className="text-link case-back" href={sectionHref('work')}><Icon name="arrow" />Back to the featured project</a>
      <VerduraFeature placement="standalone" />
    </main>
  )
}
