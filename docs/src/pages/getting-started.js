import { CodeBlock, injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  bundles: {
    code: `// bubble.js  — Core bundle (~5 kb gzipped)
// Includes: signals, reactivity engine, router
// Does NOT include: pub/sub events, JobManager
import { createComponent, createRouter, Signal, effect } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble.js"

// bubble-events.js  — Events only (+1 kb gzipped)
// Import this separately when you need pub/sub
import { bubble } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-events.js"

// bubble-full.js  — Core + Events (~6 kb gzipped)
// Everything in one import — convenient for quick prototypes
import { createComponent, createRouter } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-full.js"
import { bubble } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-full.js"`,
    lang: 'javascript', filename: 'main.js',
  },
  npm: { code: `npm install tinybubble`, lang: 'bash' },
  npmImport: {
    code: `// Core (signals + reactivity + router)
import { createComponent, createSignal, effect, createRouter } from 'tinybubble'

// Pub/sub events — separate entry to keep core bundle lean
import { bubble } from 'tinybubble/events'

// Or import everything from the full bundle
import { createComponent, createRouter, bubble } from 'tinybubble/full'`,
    lang: 'javascript', filename: 'main.js',
  },
  component: {
    code: `// components/Counter.js
export default {
  name: 'Counter',

  template() {
    return \`
      <div class="p-4 space-y-2">
        <p>Count: <strong>{{ counter }}</strong></p>
        <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="increment">
          Increment
        </button>
      </div>
    \`
  },

  data() {
    return { counter: 0 }
  },

  increment() {
    this.data.counter.value++
  },
}`,
    lang: 'javascript', filename: 'components/Counter.js',
  },
  mount: {
    code: `// main.js
import { createComponent } from 'tinybubble'
import Counter from './components/Counter.js'

const app = createComponent(Counter)
app.appendTo(document.getElementById('app'))`,
    lang: 'javascript', filename: 'main.js',
  },
  signalStyle: {
    code: `import { html, createSignal, effect } from 'tinybubble'

const [getCount, setCount] = createSignal(0)

const btn  = html(\`<button>Clicked: <span id="n">0</span> times</button>\`)
const span = btn.querySelector('#n')

effect(() => { span.textContent = getCount() })
btn.addEventListener('click', () => setCount(getCount() + 1))

document.body.appendChild(btn)`,
    lang: 'javascript',
  },
}

export default {
  name: 'GettingStartedPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Getting Started</h1>
        <p class="lead">
          TinyBubble is a micro reactive UI library under 5 kb gzipped. Signal-based reactivity,
          Vue-like templating directives, a tiny router, and a pub/sub event bus — no build step required.
        </p>

        <h2>Installation</h2>

        <h3>Bundles</h3>
        <p>
          TinyBubble ships as three separate entry points so you pay only for what you use.
          The pub/sub event bus is <strong>not</strong> included in the core bundle.
        </p>

        <div class="not-prose overflow-x-auto my-6">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-2 pr-6 font-semibold text-gray-700 dark:text-gray-300">Bundle</th>
                <th class="text-left py-2 pr-6 font-semibold text-gray-700 dark:text-gray-300">Includes</th>
                <th class="text-left py-2 font-semibold text-gray-700 dark:text-gray-300">Gzipped</th>
              </tr>
            </thead>
            <tbody class="text-gray-600 dark:text-gray-400">
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-2 pr-6 font-mono text-brand-600 dark:text-brand-400">bubble.js</td>
                <td class="py-2 pr-6">Signals, reactivity, router</td>
                <td class="py-2 font-mono font-semibold text-gray-900 dark:text-gray-100">~5 kb</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-2 pr-6 font-mono text-brand-600 dark:text-brand-400">bubble-events.js</td>
                <td class="py-2 pr-6">Pub/sub, EventTopic, JobManager</td>
                <td class="py-2 font-mono font-semibold text-gray-900 dark:text-gray-100">+1 kb</td>
              </tr>
              <tr>
                <td class="py-2 pr-6 font-mono text-brand-600 dark:text-brand-400">bubble-full.js</td>
                <td class="py-2 pr-6">Everything above</td>
                <td class="py-2 font-mono font-semibold text-gray-900 dark:text-gray-100">~6 kb</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div data-code="bundles"></div>

        <h3>npm</h3>
        <div data-code="npm"></div>
        <div data-code="npmImport"></div>

        <h2>Your first component</h2>
        <p>
          A component is a plain JS object with <code>template()</code>, <code>data()</code>,
          and methods. Call <code>createComponent()</code> to instantiate and mount it.
        </p>
        <div data-code="component"></div>

        <h3>Mount it</h3>
        <div data-code="mount"></div>

        <h2>Signal style (SolidJS / Svelte Runes)</h2>
        <p>
          Use the lower-level <code>createSignal</code> and <code>effect</code> primitives
          directly for fine-grained control without the component wrapper.
        </p>
        <div data-code="signalStyle"></div>

        <h2>Next steps</h2>
        <ul>
          <li><a href="#/guide/signals">Signals &amp; Reactivity</a> — deep dive into reactive primitives</li>
          <li><a href="#/guide/templating">Templating</a> — all directives and binding syntax</li>
          <li><a href="#/guide/components">Component System</a> — props, emits, lifecycle</li>
          <li><a href="#/guide/router">Router</a> — hash / history routing</li>
        </ul>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <a href="#/guide/signals"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Signals &amp; Reactivity</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
