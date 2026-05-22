import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  import: {
    code: `// bubble-full includes events
import { bubble } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-full.js"

// via npm — separate entry point to keep bundle small
import { bubble } from 'tinybubble/events'

// bubble is a singleton Bubble instance
// bubble.events is the root EventTopic`,
    lang: 'javascript',
  },
  topicCreate: {
    code: `// Get or create a topic (idempotent)
const cartTopic = bubble.events.topic('cart')

// Nested topics — returns a child EventTopic
const userOrdersTopic = bubble.events.topic('user').topic('orders')`,
    lang: 'javascript',
  },
  on: {
    code: `import { bubble } from 'tinybubble/events'

// .on(event, callback, id?)
// id is optional — auto-generated if omitted; useful for targeted removal
bubble.events.topic('cart').on('item:added', (item) => {
  console.log('added:', item)
})

// With explicit ID
bubble.events.topic('cart').on('item:added', handler, 'my-unique-id')`,
    lang: 'javascript',
  },
  emit: {
    code: `// .emit(event, ...args)
bubble.events.topic('cart').emit('item:added', { id: 42, qty: 1 })
bubble.events.topic('ui').emit('toast', 'Saved!', 'success')

// Multiple args — all passed to the callback
bubble.events.topic('ws').emit('message', type, payload, timestamp)`,
    lang: 'javascript',
  },
  off: {
    code: `function onAdded(item) { /* ... */ }

bubble.events.topic('cart').on('item:added', onAdded)

// Remove by callback reference
bubble.events.topic('cart').off('item:added', onAdded)

// Remove by ID
bubble.events.topic('cart').off('item:added', null, 'my-unique-id')`,
    lang: 'javascript',
  },
  one: {
    code: `// .one() — fires EXACTLY ONCE, then auto-removes
bubble.events.topic('app').one('ready', () => {
  console.log('App ready — fires once')
  this.initPlugins()
})`,
    lang: 'javascript',
  },
  once: {
    code: `// .once(event) — emit the event once and immediately remove all its listeners
// Note: this is different from .one() — it FIRES right now then clears listeners
bubble.events.topic('lifecycle').once('destroy')
// All 'destroy' listeners are called once, then removed`,
    lang: 'javascript',
  },
  removeAll: {
    code: `// Remove ALL listeners from a topic (every event)
bubble.events.topic('cart').removeAllListeners()`,
    lang: 'javascript',
  },
  removeTopic: {
    code: `// Completely remove a child topic and all its listeners
bubble.events.remove('cart')   // deletes bubble.events.topics['cart']`,
    lang: 'javascript',
  },
  bubbleUp: {
    code: `// .bubble(event) — emit on this topic AND propagate up to its parent
const child = bubble.events.topic('child')
child.bubble('myEvent')
// → fires 'myEvent' on child, then calls parent.bubble(child, ['myEvent'])`,
    lang: 'javascript',
  },
  state: {
    code: `// bubble.state — a plain object for global shared state
bubble.state.user = { id: 42, name: 'Alice' }

// Read from anywhere
console.log(bubble.state.user.name)

// Useful for bootstrapping shared data before components mount`,
    lang: 'javascript',
  },
  componentPattern: {
    code: `import { bubble } from 'tinybubble/events'

export default {
  name: 'CartIcon',
  data() { return { count: 0 } },
  template() { return \`<button>🛒 {{ count }}</button>\` },

  init() {
    // Store handler ref for cleanup
    this._onAdded   = ()  => { this.data.count.value++ }
    this._onRemoved = ()  => { this.data.count.value-- }
    this._onCleared = ()  => { this.data.count.value = 0 }

    bubble.events.topic('cart').on('item:added',   this._onAdded)
    bubble.events.topic('cart').on('item:removed', this._onRemoved)
    bubble.events.topic('cart').on('cleared',      this._onCleared)
  },

  beforeDestroy() {
    bubble.events.topic('cart').off('item:added',   this._onAdded)
    bubble.events.topic('cart').off('item:removed', this._onRemoved)
    bubble.events.topic('cart').off('cleared',      this._onCleared)
  },
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'EventTopicPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>EventTopic API</h1>
        <p class="lead">
          <code>bubble.events</code> is an <code>EventTopic</code> instance — a hierarchical event bus
          that supports named topics, single-fire listeners, and listener cleanup.
        </p>

        <h2>Import</h2>
        <div data-code="import"></div>

        <h2>Topics</h2>
        <p>Topics are namespaced channels. <code>.topic(name)</code> creates the topic if it doesn't exist yet.</p>
        <div data-code="topicCreate"></div>

        <h2><code>.on(event, callback, id?)</code></h2>
        <p>Register a listener. Returns the topic itself (chainable).</p>
        <div data-code="on"></div>

        <h2><code>.emit(event, ...args)</code></h2>
        <p>Fire an event, passing any extra arguments to all listeners.</p>
        <div data-code="emit"></div>

        <h2><code>.off(event, callback?, id?)</code></h2>
        <p>Remove a listener by callback reference or by ID.</p>
        <div data-code="off"></div>

        <h2><code>.one(event, callback)</code></h2>
        <p>Register a listener that fires exactly once and then auto-removes itself.</p>
        <div data-code="one"></div>

        <h2><code>.once(event)</code></h2>
        <p>
          Emit an event <em>right now</em> and then remove all its listeners immediately.
          Different from <code>.one()</code> — this fires and clears, it doesn't register a future listener.
        </p>
        <div data-code="once"></div>

        <h2><code>.removeAllListeners()</code></h2>
        <p>Wipe all listeners from every event on the topic.</p>
        <div data-code="removeAll"></div>

        <h2><code>.remove(topicName)</code></h2>
        <p>Delete a child topic entirely.</p>
        <div data-code="removeTopic"></div>

        <h2><code>.bubble(event)</code></h2>
        <p>Emit on this topic and propagate upward to the parent topic.</p>
        <div data-code="bubbleUp"></div>

        <h2><code>bubble.state</code></h2>
        <p>A plain object on the singleton for lightweight global state sharing — no reactivity, just a shared bag.</p>
        <div data-code="state"></div>

        <h2>Full component pattern</h2>
        <p>The canonical way to use pub/sub in a component: store handler refs on <code>this</code>, remove them in <code>beforeDestroy</code>.</p>
        <div data-code="componentPattern"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/pubsub"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Pub / Sub</span>
          </a>
          <a href="#/guide/jobmanager"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">JobManager</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
