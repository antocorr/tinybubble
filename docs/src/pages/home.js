import { CodeBlock } from '../components/CodeBlock.js'

const counterExample = `import { createComponent } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble.js"

export default {
  name: 'Counter',
  template() {
    return \`
      <div>
        <p>Count: <strong>{{ counter }}</strong></p>
        <button @click="increment">+1</button>
      </div>
    \`
  },
  data() { return { counter: 0 } },
  increment() { this.data.counter.value++ }
}

createComponent(Counter).appendTo(document.getElementById('app'))`

export default {
  name: 'HomePage',

  template() {
    return /*html*/`
      <div>
        <!-- Hero -->
        <div class="text-center py-16 px-4">
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-brand-500/20 absolute inset-0 scale-150"></div>
              <svg class="w-20 h-20 text-brand-500 relative" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="4"/>
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/>
                <circle cx="12" cy="12" r="13" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
              </svg>
            </div>
          </div>

          <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-brand-500 to-teal-400 bg-clip-text text-transparent">
            TinyBubble
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-2 max-w-xl mx-auto">
            A <strong class="text-brand-600 dark:text-brand-400">~5 kb</strong> reactive UI library
            based on Signals and pub/sub.
          </p>
          <p class="text-gray-500 dark:text-gray-500 mb-4 max-w-lg mx-auto">
            No virtual DOM. Vue-like template syntax. No build step required.
          </p>
          <div class="flex flex-wrap justify-center gap-2 mb-10 text-xs font-mono text-gray-500 dark:text-gray-400">
            <span class="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800">core ~5 kb</span>
            <span class="self-center">+</span>
            <span class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">events +1 kb</span>
            <span class="self-center">=</span>
            <span class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">full ~6 kb</span>
          </div>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="#/guide/getting-started"
               class="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-500/20">
              Get Started →
            </a>
            <a href="https://github.com/antocorr/tinybubble" target="_blank" rel="noopener"
               class="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300
                      hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors">
              GitHub
            </a>
          </div>
        </div>

        <!-- Features -->
        <div class="grid md:grid-cols-3 gap-6 mb-16">
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="font-semibold mb-2">Signal-based reactivity</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Fine-grained reactivity with automatic dependency tracking. Effects re-run only when their signals change.</p>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">🧩</div>
            <h3 class="font-semibold mb-2">Familiar templating</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Vue-style <code>{<wbr>{ }<wbr>}</code>, <code>:attr</code>, <code>@event</code>, <code>x-for</code>, <code>x-if</code> directives — zero learning curve.</p>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">📦</div>
            <h3 class="font-semibold mb-2">Modular &amp; tiny</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Core (signals + reactivity + router): <strong>~5 kb</strong> gzipped.
              Add pub/sub for <strong>+1 kb</strong>. Full bundle: <strong>~6 kb</strong>.
              Pay only for what you import.
            </p>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">🔀</div>
            <h3 class="font-semibold mb-2">Built-in router</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Hash or history mode with dynamic params, persistent pages, and lazy-loaded components.</p>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">📡</div>
            <h3 class="font-semibold mb-2">Pub / Sub events</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Decoupled cross-component communication with named topics. No prop-drilling.</p>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <div class="text-3xl mb-3">🤖</div>
            <h3 class="font-semibold mb-2">AI-friendly</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">The whole mental model fits in an LLM context window. Generate and refactor with any AI.</p>
          </div>
        </div>

        <!-- Quick example -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-8">
          <h2 class="text-xl font-bold mb-2">See it in action</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">A reactive counter in under 20 lines — no build step, no config:</p>
          <div data-code="counter"></div>
        </div>
      </div>
    `
  },

  init() {
    this.$element.querySelector('[data-code="counter"]')
      .appendChild(CodeBlock({ code: counterExample, lang: 'javascript' }))
  },
}
