import { createRoot, hydrateRoot } from 'react-dom/client'
import './fonts.css'
import './styles.css'
import { App } from './App'
import { localeOf, routeFromPath, routes, type Route } from './config'

const root = document.getElementById('root')!
const renderedRoute = root.dataset.route
const requestedRoute = routeFromPath(window.location.pathname)
// Pages always serves one root 404 document. Keep its native language link for no-JS
// visitors; for a missing /cnr/ URL, enhance the error in place, without redirecting.
const localizedError = renderedRoute === '/404' && requestedRoute === '/cnr/404'
const route = !localizedError && renderedRoute && Object.hasOwn(routes, renderedRoute) ? (renderedRoute as Route) : requestedRoute
if (import.meta.env.DEV || localizedError) {
  root.dataset.route = route
  document.title = routes[route].title
  document.documentElement.lang = localeOf(route)
  document.querySelector('meta[name="description"]')?.setAttribute('content', routes[route].description)
}
if (!localizedError && root.hasChildNodes() && root.querySelector('main')) {
  hydrateRoot(root, <App route={route} />)
} else {
  createRoot(root).render(<App route={route} />)
}
