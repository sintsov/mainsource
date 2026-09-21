import { renderToString } from 'react-dom/server'
import { App } from './App'
import { routes, basePath, company, type Route } from './config'

export { routes, basePath, company }
export function render(route: Route) {
  return renderToString(<App route={route} />)
}
