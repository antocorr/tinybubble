import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  watchRoute: {
    code: `import { globals, watch } from 'tinybubble'

export default {
  name: 'ProductPage',
  data() { return { product: null, loading: false } },
  template() {
    return \`
      <div>
        <div x-show="loading">Loading…</div>
        <div x-if="product">
          <h1>{{ product.name }}</h1>
          <p>{{ product.description }}</p>
        </div>
      </div>
    \`
  },
  init() {
    this.load(globals.$route.value.params.id)
    // Re-load when route changes (e.g. /product/1 → /product/2)
    watch(globals.$route, ({ params }) => this.load(params.id))
  },
  async load(id) {
    this.data.loading.value = true
    this.data.product.value = await fetchProduct(id)
    this.data.loading.value = false
  },
}`,
    lang: 'javascript',
  },
  queryParams: {
    code: `// URL: /search?q=hello&page=2

// In template
<p>Query: {{ $route.query.q }}</p>
<p>Page: {{ $route.query.page }}</p>

// In a method
const { q, page } = globals.$route.value.query
fetchResults(q, parseInt(page) || 1)`,
    lang: 'javascript',
  },
  activeLink: {
    code: `export default {
  name: 'NavBar',
  components: { 'router-link': router.RouterLink },
  template() {
    return \`
      <nav class="flex gap-4">
        <router-link to="/"
          :class="{ 'text-brand-600 font-bold': $route.path === '/' }">
          Home
        </router-link>
        <router-link to="/about"
          :class="{ 'text-brand-600 font-bold': $route.path === '/about' }">
          About
        </router-link>
      </nav>
    \`
  },
}`,
    lang: 'javascript',
  },
  functional: {
    code: `// A route component can be a plain function: receives { $route }, returns HTMLElement
function ErrorPage({ $route }) {
  const el = document.createElement('div')
  el.innerHTML = \`<h1>404 — Not found</h1><p>Path: \${$route.path}</p>\`
  return el
}

routes: [
  { path: '*', component: ErrorPage }
]`,
    lang: 'javascript',
  },
  srcBase: {
    code: `import { createRouter } from 'tinybubble'

// Lazy routes resolved relative to this module's URL
export const router = createRouter({
  mode: 'hash',
  srcBase: import.meta.url,
  routes: [
    { path: '/',       component: Home },
    { path: '/editor', src: './pages/Editor.js' },  // resolved from srcBase
  ],
})`,
    lang: 'javascript', filename: 'router.js',
  },
  fullExample: {
    code: `// router.js
import { createRouter } from 'tinybubble'
import Home  from './pages/Home.js'
import About from './pages/About.js'

export const router = createRouter({
  mode: 'hash',
  srcBase: import.meta.url,
  routes: [
    { path: '/',         component: Home },
    { path: '/about',    component: About },
    { path: '/post/:id', src: './pages/Post.js' },
    { path: '*',         src: './pages/NotFound.js' },
  ],
})

// App.js
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
        <main><router-view></router-view></main>
      </div>
    \`
  },
}

// main.js
import { createComponent } from 'tinybubble'
import './router.js'
import App from './App.js'

createComponent(App).appendTo(document.getElementById('app'))`,
    lang: 'javascript',
  },
}

export default {
  name: 'RouterAdvancedPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Dynamic Routes</h1>
        <p class="lead">Advanced router patterns: watching route changes, query params, active links, and functional page components.</p>

        <h2>Watching route changes</h2>
        <p>Because <code>$route</code> is a signal you can <code>watch</code> it — useful when the same component handles multiple param values.</p>
        <div data-code="watchRoute"></div>

        <h2>Query string params</h2>
        <div data-code="queryParams"></div>

        <h2>Active link styling</h2>
        <p>Compare <code>$route.path</code> in a <code>:class</code> binding on <code>router-link</code>.</p>
        <div data-code="activeLink"></div>

        <h2>Functional page components</h2>
        <p>A route's <code>component</code> can be a plain function that receives <code>{ $route }</code> and returns an <code>HTMLElement</code>.</p>
        <div data-code="functional"></div>

        <h2>srcBase for lazy imports</h2>
        <p>Pass <code>srcBase: import.meta.url</code> so lazy <code>src</code> paths resolve relative to the router file.</p>
        <div data-code="srcBase"></div>

        <h2>Complete SPA example</h2>
        <div data-code="fullExample"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/router"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Router — Setup &amp; Navigation</span>
          </a>
          <a href="#/guide/pubsub"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Pub / Sub</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
