import { injectCodeBlocks } from '../components/CodeBlock.js'

const allExports = `import {
  // Reactive primitives
  Signal, SignalObject,
  createSignal,
  effect,
  watch,
  untrack,
  computed,
  tick,
  collectEffects,

  // Component system
  createComponent,
  html,
  importComponent,
  watchProp,
  globals,

  // Router
  createRouter,
} from 'tinybubble'`

const blocks = {
  allImports: { code: allExports, lang: 'javascript', filename: 'main.js' },
  signal: {
    code: `const count = Signal(0)
const user  = Signal({ name: 'Alice' })

count.value          // 0
count.value = 1      // triggers subscribers

user.value.name = 'Bob'  // ✅ tracked via Proxy`,
    lang: 'javascript',
  },
  createSignal: {
    code: `const [getCount, setCount, refresh] = createSignal(0)

effect(() => console.log(getCount()))

setCount(10)       // → 10
refresh()          // force notify without value change`,
    lang: 'javascript',
  },
  effect: {
    code: `const name = Signal('Alice')

const stop = effect(() => {
  document.title = 'Hello, ' + name.value
})

name.value = 'Bob'   // title updates

stop()               // stops — no more updates`,
    lang: 'javascript',
  },
  watch: {
    code: `const query = Signal('')

// NOT called on mount — only on subsequent changes
// callback reads are untracked
watch(query, (newVal, oldVal) => {
  fetchResults(newVal)
})

// Also accepts a getter
watch(() => user.value.name, (name) => console.log(name))`,
    lang: 'javascript',
  },
  untrack: {
    code: `const count = Signal(0)
const debug = Signal(false)

effect(() => {
  console.log(count.value)
  untrack(() => debug.value)
})

debug.value = true  // no re-run
count.value = 1     // re-runs`,
    lang: 'javascript',
  },
  computed: {
    code: `const a = Signal(2), b = Signal(3)
const sum = computed(() => a.value + b.value)

effect(() => console.log(sum.value))   // 5
a.value = 10   // → 13`,
    lang: 'javascript',
  },
  tick: {
    code: `const x = Signal(0)
effect(() => { el.textContent = x.value })

x.value = 42
// DOM still 0 (batched microtask)

tick()
// el.textContent === "42" ✅`,
    lang: 'javascript',
  },
  collectEffects: {
    code: `const disposers = collectEffects(() => {
  effect(() => console.log(a.value))
  effect(() => console.log(b.value))
})

disposers.forEach(d => d())   // tear down everything`,
    lang: 'javascript',
  },
  signalObject: {
    code: `const sig = new SignalObject(42)

const unsub = sig.subscribe(() => console.log('changed'))
sig.value = 100    // → "changed"
unsub()

sig.refresh()      // force notify without value change`,
    lang: 'javascript',
  },
}

export default {
  name: 'ApiSignalsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Signals API</h1>
        <p class="lead">Complete reference for all reactive primitives exported from <code>tinybubble</code>.</p>

        <h2>All exports at a glance</h2>
        <div data-code="allImports"></div>

        <div class="not-prose space-y-8">

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">Signal</code>
              <code class="text-gray-500 font-mono text-sm">(initialValue) → SignalObject</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Creates a reactive signal. Objects are wrapped in a Proxy — property mutations are also tracked.</p>
              <div data-code="signal"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">createSignal</code>
              <code class="text-gray-500 font-mono text-sm">(initialValue) → [getter, setter, refresh]</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">SolidJS-style getter/setter/refresh tuple.</p>
              <div data-code="createSignal"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">effect</code>
              <code class="text-gray-500 font-mono text-sm">(fn) → dispose</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Runs <code>fn</code> immediately and re-runs on any signal change accessed inside. Returns a dispose function.</p>
              <div data-code="effect"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">watch</code>
              <code class="text-gray-500 font-mono text-sm">(source, callback)</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Like <code>effect</code> but lazy — callback fires only on subsequent changes, not on mount. Signals read in the callback are not tracked as dependencies.</p>
              <div data-code="watch"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">untrack</code>
              <code class="text-gray-500 font-mono text-sm">(fn) → any</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Runs <code>fn</code> without subscribing the current effect to signals read inside.</p>
              <div data-code="untrack"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">computed</code>
              <code class="text-gray-500 font-mono text-sm">(fn) → SignalObject</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Derived signal that recomputes when dependencies change.</p>
              <div data-code="computed"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">tick</code>
              <code class="text-gray-500 font-mono text-sm">()</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Flushes all pending effects synchronously. Use in tests or when you need the DOM updated immediately.</p>
              <div data-code="tick"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">collectEffects</code>
              <code class="text-gray-500 font-mono text-sm">(fn) → dispose[]</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">Runs <code>fn</code> and collects all dispose functions created inside — used by <code>createComponent</code> for clean teardown.</p>
              <div data-code="collectEffects"></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-baseline gap-2">
              <code class="text-brand-700 dark:text-brand-300 font-mono font-semibold text-base">SignalObject</code>
              <code class="text-gray-500 font-mono text-sm">class</code>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
                The underlying reactive class. Members: <code>.value</code> get/set, <code>.subscribe(fn)</code>,
                <code>.refresh()</code>, <code>.toJSON()</code>, <code>.toString()</code>, <code>.valueOf()</code>.
              </p>
              <div data-code="signalObject"></div>
            </div>
          </div>

        </div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/pubsub"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Pub / Sub</span>
          </a>
          <a href="#/api/components"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
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
