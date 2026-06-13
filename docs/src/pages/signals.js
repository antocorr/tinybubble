import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  signalBasic: {
    code: `import { Signal, effect } from 'tinybubble'

const count = Signal(0)

effect(() => {
  console.log('count is', count.value)  // runs now and on every change
})

count.value = 1   // → "count is 1"
count.value = 2   // → "count is 2"`,
    lang: 'javascript',
  },
  signalObject: {
    code: `const user = Signal({ name: 'Alice', age: 30 })

effect(() => console.log(user.value.name))

user.value.name = 'Bob'                     // ✅ tracked via Proxy → "Bob"
user.value = { name: 'Charlie', age: 25 }   // ✅ also tracked → "Charlie"`,
    lang: 'javascript',
  },
  signalMethods: {
    code: `const sig = Signal(42)

const unsub = sig.subscribe(fn)   // manual subscribe
unsub()                           // unsubscribe

sig.refresh()                     // notify subscribers without changing value

// Coercions
String(sig)                       // → "42"
+sig                              // → 42
JSON.stringify({ n: sig })        // → '{"n":42}'`,
    lang: 'javascript',
  },
  createSignal: {
    code: `import { createSignal, effect } from 'tinybubble'

const [getCount, setCount, refresh] = createSignal(0)

effect(() => console.log(getCount()))   // logs 0

setCount(1)                    // logs 1
setCount(getCount() + 1)       // increment pattern`,
    lang: 'javascript',
  },
  effectBasic: {
    code: `const a = Signal(1)
const b = Signal(2)

effect(() => {
  document.title = \`Sum: \${a.value + b.value}\`
})

a.value = 10   // title → "Sum: 12"
b.value = 20   // title → "Sum: 30"`,
    lang: 'javascript',
  },
  effectDispose: {
    code: `const stop = effect(() => {
  console.log(count.value)
})

stop()   // effect will never run again`,
    lang: 'javascript',
  },
  watch: {
    code: `import { Signal, watch } from 'tinybubble'

const query = Signal('')

// callback NOT called on mount — only on subsequent changes
// signals read inside the callback are not added as watch dependencies
watch(query, (newVal, oldVal) => {
  console.log(\`search: "\${oldVal}" → "\${newVal}"\`)
  fetchResults(newVal)
})

query.value = 'hello'   // → logs and fetches`,
    lang: 'javascript',
  },
  untrack: {
    code: `import { Signal, effect, untrack } from 'tinybubble'

const count = Signal(0)
const debug = Signal(false)

effect(() => {
  console.log(count.value)
  untrack(() => console.log('debug:', debug.value))
})

debug.value = true  // does not re-run the effect
count.value = 1     // re-runs the effect`,
    lang: 'javascript',
  },
  computed: {
    code: `import { Signal, computed, effect } from 'tinybubble'

const firstName = Signal('Ada')
const lastName  = Signal('Lovelace')

const fullName = computed(() => \`\${firstName.value} \${lastName.value}\`)

effect(() => console.log(fullName.value))   // "Ada Lovelace"

firstName.value = 'Grace'    // → "Grace Lovelace"
lastName.value  = 'Hopper'  // → "Grace Hopper"`,
    lang: 'javascript',
  },
  tick: {
    code: `import { Signal, effect, tick } from 'tinybubble'

const x = Signal(0)
effect(() => { el.textContent = x.value })

x.value = 42
// DOM not yet updated (pending microtask)

tick()
// el.textContent === "42" ✅  (forced synchronous flush)`,
    lang: 'javascript',
  },
  collectEffects: {
    code: `import { collectEffects, effect } from 'tinybubble'

const disposers = collectEffects(() => {
  effect(() => console.log(a.value))
  effect(() => console.log(b.value))
})

// Tear down everything at once
disposers.forEach(d => d())`,
    lang: 'javascript',
  },
  componentReactivity: {
    code: `export default {
  name: 'Timer',
  template() {
    return \`
      <div>
        <p>Seconds: {{ elapsed }}</p>
        <button @click="reset">Reset</button>
      </div>
    \`
  },
  data() { return { elapsed: 0 } },
  init() {
    this._timer = setInterval(() => {
      this.data.elapsed.value++
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this._timer)
  },
  reset() {
    this.data.elapsed.value = 0
  },
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'SignalsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Signals &amp; Reactivity</h1>
        <p class="lead">
          TinyBubble's reactivity is built on <strong>Signals</strong> — observable values that
          automatically notify any <code>effect</code> that read them when they change.
          Multiple mutations within the same synchronous tick are batched via <code>queueMicrotask</code>.
        </p>

        <h2>Signal</h2>
        <p>The simplest reactive primitive. Read <code>.value</code> to get, write <code>.value</code> to update.</p>
        <div data-code="signalBasic"></div>

        <h3>Object signals</h3>
        <p>Objects are wrapped in a <code>Proxy</code> — direct property mutations are also tracked.</p>
        <div data-code="signalObject"></div>

        <h3>SignalObject methods</h3>
        <div data-code="signalMethods"></div>

        <h2>createSignal</h2>
        <p>Returns a <em>getter / setter / refresh</em> tuple — the SolidJS-style API.</p>
        <div data-code="createSignal"></div>

        <h2>effect</h2>
        <p>Runs a function immediately and re-runs it whenever any signal accessed inside changes. Returns a dispose function.</p>
        <div data-code="effectBasic"></div>
        <blockquote>
          <strong>Auto-tracking:</strong> any signal accessed via <code>.value</code> inside an effect is automatically subscribed. No dependency list needed.
        </blockquote>
        <div data-code="effectDispose"></div>

        <h2>watch</h2>
        <p>Like <code>effect</code> but <em>lazy</em> — the callback only fires on subsequent changes, not on first run. Reads inside the callback are untracked, so <code>watch(source, cb)</code> stays subscribed to <code>source</code>.</p>
        <div data-code="watch"></div>

        <h2>untrack</h2>
        <p>Runs a function without subscribing the current reactive effect to any signals read inside.</p>
        <div data-code="untrack"></div>

        <h2>computed</h2>
        <p>Creates a derived signal that recomputes whenever dependencies change.</p>
        <div data-code="computed"></div>

        <h2>tick</h2>
        <p>Flushes all pending effects <em>synchronously</em> — useful in tests or when you need the DOM updated immediately.</p>
        <div data-code="tick"></div>

        <h2>Effect scopes</h2>
        <p><code>collectEffects(fn)</code> collects all dispose functions created inside <code>fn</code> — used internally by <code>createComponent</code> for clean teardown.</p>
        <div data-code="collectEffects"></div>

        <h2>Reactivity in components</h2>
        <p>
          Inside a component, <code>data()</code> values are automatically signals.
          Access them via <code>this.data.key.value</code> in methods and <code>{<wbr>{ key }<wbr>}</code> in templates.
        </p>
        <div data-code="componentReactivity"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/getting-started"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Getting Started</span>
          </a>
          <a href="#/guide/templating"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Templating</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
