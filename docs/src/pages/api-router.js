import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  createRouter: {
    code: `import { createRouter } from 'tinybubble'

export const router = createRouter({
  mode:    'hash',        // 'hash' | 'history'
  base:    '/',           // base path for history mode
  srcBase: import.meta.url,  // used to resolve lazy 'src' routes
  routes: [
    { path: '/',          component: Home },
    { path: '/about',     component: About },
    { path: '/post/:id',  src: './pages/Post.js' },    // lazy
    { path: '/dash',      component: Dashboard, persistent: true },
    { path: '*',          component: NotFound },
  ],
})`,
    lang: 'javascript', filename: 'router.js',
  },
  routeShape: {
    code: `// Route object properties:
{
  path:        '/user/:id',        // string — segments starting with : are params
  component:   UserPage,           // component definition or functional component
  src:         './pages/User.js',  // use instead of component for lazy loading
  data:        { props: { … } },   // optional overrides passed to createComponent
  persistent:  true,               // keep component alive in memory on navigation
}

// Wildcards
{ path: '*', component: NotFound }

// Optional param
{ path: '/docs/:slug?', component: DocsPage }`,
    lang: 'javascript',
  },
  navigate: {
    code: `router.navigate('/about')
router.navigate('/user/42')
router.navigate('/search?q=hello&page=2')`,
    lang: 'javascript',
  },
  routerLink: {
    code: `// Register in component
components: { 'router-link': router.RouterLink }

// Template
<router-link to="/about">About</router-link>
<router-link to="/user/42" class="nav-item">Profile</router-link>
<router-link to="/docs" :class="{ active: $route.path.startsWith('/docs') }">Docs</router-link>`,
    lang: 'javascript',
  },
  routerView: {
    code: `// Register in component
components: { 'router-view': router.RouterView }

// Template — renders the matched route component
<main>
  <router-view></router-view>
</main>`,
    lang: 'javascript',
  },
  routeSignal: {
    code: `// Available everywhere after createRouter() is called
// Shape: { path: '/user/42', params: { id: '42' }, query: { tab: 'posts' } }

// In templates
<p>Path: {{ $route.path }}</p>
<p>User ID: {{ $route.params.id }}</p>
<p>Tab: {{ $route.query.tab }}</p>

// In JS
import { globals } from 'tinybubble'
const { path, params, query } = globals.$route.value`,
    lang: 'javascript',
  },
}

export default {
  name: 'ApiRouterPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Router API</h1>
        <p class="lead">Reference for <code>createRouter</code> and the router instance it returns.</p>

        <div class="not-prose space-y-8">

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">createRouter</code>
              <code class="text-gray-500 font-mono text-sm">(options) → RouterInstance</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Options: <code>mode</code>, <code>base</code>, <code>routes</code>, <code>srcBase</code>. Registers <code>globals.$route</code> automatically.</p>
              <div data-code="createRouter"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">Route object</code>
            </div>
            <div class="px-5 py-4">
              <div data-code="routeShape"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">router.navigate</code>
              <code class="text-gray-500 font-mono text-sm">(path)</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Programmatic navigation. In hash mode pushes to <code>location.hash</code>; in history mode calls <code>history.pushState</code>.</p>
              <div data-code="navigate"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">router.RouterLink</code>
              <code class="text-gray-500 font-mono text-sm">(props) | &lt;router-link to="..."&gt;</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Renders an <code>&lt;a&gt;</code> that calls <code>router.navigate</code> on click. Extra attributes are forwarded to the anchor.</p>
              <div data-code="routerLink"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">router.RouterView</code>
              <code class="text-gray-500 font-mono text-sm">&lt;router-view&gt;</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Outlet that renders the matched route component. Destroys the previous component on navigation (unless <code>persistent</code>).</p>
              <div data-code="routerView"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">globals.$route</code>
              <code class="text-gray-500 font-mono text-sm">SignalObject → { path, params, query }</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Reactive signal set on globals when <code>createRouter</code> is called. Updated on every navigation.</p>
              <div data-code="routeSignal"></div>
            </div>
          </div>

        </div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-start">
          <a href="#/api/components"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Component API</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
