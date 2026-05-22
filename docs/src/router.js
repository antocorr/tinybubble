import { createRouter } from 'tinybubble'

export const router = createRouter({
  mode: 'hash',
  srcBase: import.meta.url,
  routes: [
    { path: '/',                       src: './pages/home.js' },
    { path: '/guide/getting-started',  src: './pages/getting-started.js' },
    { path: '/guide/signals',          src: './pages/signals.js' },
    { path: '/guide/templating',       src: './pages/templating.js' },
    { path: '/guide/components',       src: './pages/components.js' },
    { path: '/guide/globals',          src: './pages/globals.js' },
    { path: '/guide/router',           src: './pages/router.js' },
    { path: '/guide/router-advanced',  src: './pages/router-advanced.js' },
    { path: '/guide/pubsub',           src: './pages/pubsub.js' },
    { path: '/guide/eventtopic',       src: './pages/eventtopic.js' },
    { path: '/guide/jobmanager',       src: './pages/jobmanager.js' },
    { path: '/api/signals',            src: './pages/api-signals.js' },
    { path: '/api/components',         src: './pages/api-components.js' },
    { path: '/api/router',             src: './pages/api-router.js' },
    { path: '/api/events',             src: './pages/api-events.js' },
    { path: '*',                       src: './pages/not-found.js' },
  ],
})
