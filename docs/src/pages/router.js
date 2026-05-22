import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  setup: {
    code: `// router.js
import { createRouter } from 'tinybubble'
import Home     from './pages/Home.js'
import About    from './pages/About.js'
import NotFound from './pages/NotFound.js'

export const router = createRouter({
  mode: 'hash',           // 'hash' | 'history'
  base: '/',
  routes: [
    { path: '/',         component: Home },
    { path: '/about',    component: About },
    { path: '/user/:id', src: './pages/User.js' },   // lazy
    { path: '*',         component: NotFound },
  ],
})`,
    lang: 'javascript', filename: 'router.js',
  },
  layout: {
    code: `// App.js
import { router } from './router.js'

export default {
  name: 'App',
  components: {
    'router-link': router.RouterLink,
    'router-view': router.RouterView,
  },
  template() {
    return \`
      <div>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
        </nav>
        <main>
          <router-view></router-view>
        </main>
      </div>
    \`
  },
}`,
    lang: 'javascript', filename: 'App.js',
  },
  modes: {
    code: `// Hash mode (works on static hosts — GitHub Pages, S3, ...)
// URLs: https://example.com/#/about
createRouter({ mode: 'hash', routes })

// History mode (requires server fallback to index.html)
// URLs: https://example.com/about
createRouter({ mode: 'history', routes })`,
    lang: 'javascript',
  },
  routeSignal: {
    code: `// $route is available in any template after createRouter() is called
// Shape: { path: '/user/42', params: { id: '42' }, query: { tab: 'posts' } }

// In a template
<p>User ID: {{ $route.params.id }}</p>
<p>Active path: {{ $route.path }}</p>

// In a method
import { globals } from 'tinybubble'
const id = globals.$route.value.params.id`,
    lang: 'javascript',
  },
  navigate: {
    code: `import { router } from './router.js'

router.navigate('/about')
router.navigate('/user/42')
router.navigate('/search?q=hello')

// From a component method
export default {
  async submit() {
    await authService.login(this.data.email.value, this.data.password.value)
    router.navigate('/dashboard')
  },
}`,
    lang: 'javascript',
  },
  params: {
    code: `routes: [
  { path: '/user/:id',              component: UserPage },
  { path: '/user/:id/post/:postId', component: PostPage },
  { path: '/docs/:slug?',           component: DocsPage },  // optional param
]

// In the page — $route.params is reactive
export default {
  name: 'UserPage',
  template() { return \`<h1>User #{{ $route.params.id }}</h1>\` },
  init() {
    import { globals, watch } from 'tinybubble'
    watch(globals.$route, ({ params }) => this.loadUser(params.id))
    this.loadUser(globals.$route.value.params.id)
  },
  async loadUser(id) { /* fetch */ },
}`,
    lang: 'javascript',
  },
  persistent: {
    code: `routes: [
  { path: '/',          component: Home },
  // Dashboard stays alive in memory — scroll position and state preserved
  { path: '/dashboard', component: Dashboard, persistent: true },
]`,
    lang: 'javascript',
  },
  lazy: {
    code: `routes: [
  { path: '/',       component: Home },            // eagerly loaded
  { path: '/editor', src: './pages/Editor.js' },   // fetched on first visit
  { path: '/charts', src: './pages/Charts.js' },
]
// Module is cached after first load — no repeated network requests`,
    lang: 'javascript',
  },
  base: {
    code: `// GitHub Pages: served at https://user.github.io/my-repo/
createRouter({
  mode: 'hash',
  base: '/my-repo/',
  routes,
})`,
    lang: 'javascript',
  },
}

export default {
  name: 'RouterPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Router — Setup &amp; Navigation</h1>
        <p class="lead">
          TinyBubble ships with a tiny client-side router. Hash and history modes,
          <code>&lt;router-link&gt;</code>, <code>&lt;router-view&gt;</code>, dynamic params,
          and a reactive <code>$route</code> signal.
        </p>

        <h2>Setup</h2>
        <div data-code="setup"></div>

        <h2>RouterLink &amp; RouterView</h2>
        <p>Register both in your root component's <code>components</code> map, then use them in the template.</p>
        <div data-code="layout"></div>

        <h2>Hash vs History mode</h2>
        <div data-code="modes"></div>

        <h2>The <code>$route</code> signal</h2>
        <p>After <code>createRouter()</code> is called, <code>$route</code> is available globally in all templates and updates on every navigation.</p>
        <div data-code="routeSignal"></div>

        <h2>Programmatic navigation</h2>
        <div data-code="navigate"></div>

        <h2>Dynamic routes with params</h2>
        <div data-code="params"></div>

        <h2>Persistent pages</h2>
        <p>Set <code>persistent: true</code> to keep the component alive in memory when navigating away.</p>
        <div data-code="persistent"></div>

        <h2>Lazy-loaded routes</h2>
        <p>Use <code>src</code> instead of <code>component</code> — the module is fetched only on first visit.</p>
        <div data-code="lazy"></div>

        <h2>Base path</h2>
        <div data-code="base"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/globals"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Globals</span>
          </a>
          <a href="#/guide/router-advanced"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Dynamic Routes</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
