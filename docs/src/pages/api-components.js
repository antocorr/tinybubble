import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  createComponent: {
    code: `import { createComponent } from 'tinybubble'
import MyComp from './MyComp.js'

const c = createComponent(MyComp)
c.appendTo(document.body)

// With props
const c2 = createComponent(MyComp, { props: { title: 'Hi' } })

// Instance shape:
// c.$element       HTMLElement
// c.appendTo(el)   mount
// c.$destroy()     teardown
// c.data           { key: SignalObject }
// c.props          Proxy (read-only, already unwrapped)
// c.refs           { refName: HTMLElement }
// c.emit(ev, ...)  fire an emit event`,
    lang: 'javascript',
  },
  html: {
    code: `import { html } from 'tinybubble'

const card = html(\`
  <div class="card">
    <h2>Title</h2>
    <p>Body text</p>
  </div>
\`)

document.body.appendChild(card)   // HTMLElement`,
    lang: 'javascript',
  },
  importComponent: {
    code: `import { importComponent } from 'tinybubble'

const widget = await importComponent('./components/Chart.js', {
  props: { dataset: myData }
})
widget.appendTo(container)

// Cached after first call
await importComponent('./components/Chart.js')  // no network request`,
    lang: 'javascript',
  },
  watchProp: {
    code: `import { watchProp } from 'tinybubble'

export default {
  name: 'Chart',
  props: ['dataset'],
  init() {
    watchProp(this, 'dataset', (next, prev) => {
      this.redraw(next)
    })
  },
  redraw(data) { /* … */ },
}`,
    lang: 'javascript',
  },
  globals: {
    code: `import { globals } from 'tinybubble'

globals.t       = (key) => i18n[key]       // available in all templates
globals.fmt     = (n) => n.toLocaleString()
globals.$theme  = Signal('light')           // reactive — use {{ $theme }} in templates`,
    lang: 'javascript',
  },
}

export default {
  name: 'ApiComponentsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Component API</h1>
        <p class="lead">Reference for component creation, the component instance shape, and helpers.</p>

        <div class="not-prose space-y-8">

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">createComponent</code>
              <code class="text-gray-500 font-mono text-sm">(definition, overrides?, props?, parent?) → ComponentInstance</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Instantiates a component definition. Pass <code>{ props: { … } }</code> as overrides for initial prop values.</p>
              <div data-code="createComponent"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">html</code>
              <code class="text-gray-500 font-mono text-sm">(markupString) → HTMLElement</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Parses an HTML string via a <code>&lt;template&gt;</code> tag and returns the first child element.</p>
              <div data-code="html"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">importComponent</code>
              <code class="text-gray-500 font-mono text-sm">async (src, overrides?, props?) → ComponentInstance</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Dynamically imports and instantiates a component module. Modules are cached after first load.</p>
              <div data-code="importComponent"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">watchProp</code>
              <code class="text-gray-500 font-mono text-sm">(component, key, callback)</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Watches a specific prop for changes. Call from <code>init()</code>. Callback receives <code>(newValue, oldValue)</code>.</p>
              <div data-code="watchProp"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">globals</code>
              <code class="text-gray-500 font-mono text-sm">{}</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Shared object merged into every component's template scope. <code>$</code>-prefixed <code>SignalObject</code> values are also reactive component properties.</p>
              <div data-code="globals"></div>
            </div>
          </div>

        </div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/api/signals"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Signals API</span>
          </a>
          <a href="#/api/router"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Router API</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
