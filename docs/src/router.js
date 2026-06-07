import { createRouter } from 'tinybubble'
import HomePage           from './pages/home.js'
import GettingStartedPage from './pages/getting-started.js'
import SignalsPage         from './pages/signals.js'
import TemplatingPage      from './pages/templating.js'
import ComponentsPage      from './pages/components.js'
import GlobalsPage         from './pages/globals.js'
import RouterPage          from './pages/router.js'
import RouterAdvancedPage  from './pages/router-advanced.js'
import PubSubPage          from './pages/pubsub.js'
import EventTopicPage      from './pages/eventtopic.js'
import JobManagerPage      from './pages/jobmanager.js'
import ApiSignalsPage      from './pages/api-signals.js'
import ApiComponentsPage   from './pages/api-components.js'
import ApiRouterPage       from './pages/api-router.js'
import ApiEventsPage       from './pages/api-events.js'
import ExamplesPage        from './pages/examples.js'
import NotFoundPage        from './pages/not-found.js'

export const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/',                       component: HomePage },
    { path: '/guide/getting-started',  component: GettingStartedPage },
    { path: '/guide/signals',          component: SignalsPage },
    { path: '/guide/templating',       component: TemplatingPage },
    { path: '/guide/components',       component: ComponentsPage },
    { path: '/guide/globals',          component: GlobalsPage },
    { path: '/guide/router',           component: RouterPage },
    { path: '/guide/router-advanced',  component: RouterAdvancedPage },
    { path: '/guide/pubsub',           component: PubSubPage },
    { path: '/guide/eventtopic',       component: EventTopicPage },
    { path: '/guide/jobmanager',       component: JobManagerPage },
    { path: '/api/signals',            component: ApiSignalsPage },
    { path: '/api/components',         component: ApiComponentsPage },
    { path: '/api/router',             component: ApiRouterPage },
    { path: '/api/events',             component: ApiEventsPage },
    { path: '/examples',               component: ExamplesPage },
    { path: '*',                       component: NotFoundPage },
  ],
})
