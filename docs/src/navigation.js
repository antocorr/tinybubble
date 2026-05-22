export const nav = [
  {
    section: 'Introduction',
    items: [
      { label: 'What is TinyBubble?', path: '/' },
      { label: 'Getting Started',     path: '/guide/getting-started' },
    ],
  },
  {
    section: 'Core Concepts',
    items: [
      { label: 'Signals & Reactivity', path: '/guide/signals' },
      { label: 'Templating',           path: '/guide/templating' },
      { label: 'Component System',     path: '/guide/components' },
      { label: 'Globals',              path: '/guide/globals' },
    ],
  },
  {
    section: 'Router',
    items: [
      { label: 'Setup & Navigation',   path: '/guide/router' },
      { label: 'Dynamic Routes',       path: '/guide/router-advanced' },
    ],
  },
  {
    section: 'Events',
    items: [
      { label: 'Pub / Sub',            path: '/guide/pubsub' },
      { label: 'EventTopic API',       path: '/guide/eventtopic' },
      { label: 'JobManager',           path: '/guide/jobmanager' },
    ],
  },
  {
    section: 'API Reference',
    items: [
      { label: 'Signals API',          path: '/api/signals' },
      { label: 'Component API',        path: '/api/components' },
      { label: 'Router API',           path: '/api/router' },
      { label: 'Events API',           path: '/api/events' },
    ],
  },
]

export const flatNav = nav.flatMap(s => s.items)
