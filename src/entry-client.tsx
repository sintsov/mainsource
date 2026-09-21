import { createRoot, hydrateRoot } from 'react-dom/client'
import './fonts.css'
import './styles.css'
import { App } from './App'
import { routeFromPath, routes, type Route } from './config'

const root = document.getElementById('root')!
const renderedRoute = root.dataset.route
const route = renderedRoute && Object.hasOwn(routes, renderedRoute)
  ? renderedRoute as Route
  : routeFromPath(window.location.pathname)
if (import.meta.env.DEV) document.title = routes[route].title

if (root.hasChildNodes() && root.querySelector('main')) {
  hydrateRoot(root, <App route={route} />)
} else {
  createRoot(root).render(<App route={route} />)
}
