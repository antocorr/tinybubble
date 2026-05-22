import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  import: {
    code: `// The event bus ships in a SEPARATE bundle to keep the core lean.
// It is NOT included in bubble.js.

// Via npm — dedicated entry point (adds ~1 kb gzipped)
import { bubble } from 'tinybubble/events'

// From CDN — same separate file
import { bubble } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-events.js"

// Or use the full bundle (~6 kb) when you need everything together
import { bubble } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble-full.js"`,
    lang: 'javascript',
  },
  emit: {
    code: `import { bubble } from 'tinybubble/events'

bubble.events.topic('cart').emit('item:added', { id: 42, qty: 1 })
bubble.events.topic('cart').emit('item:removed', 42)
bubble.events.topic('ui').emit('toast', 'Item added!', 'success')`,
    lang: 'javascript',
  },
  on: {
    code: `// CartIcon.js
bubble.events.topic('cart').on('item:added', (item) => {
  this.data.count.value++
})

// Toast.js — no parent/child relationship needed
bubble.events.topic('ui').on('toast', (message, type) => {
  this.showToast(message, type)
})`,
    lang: 'javascript',
  },
  off: {
    code: `function onResize(size) { /* ... */ }

bubble.events.topic('layout').on('resize', onResize)

// Remove by reference
bubble.events.topic('layout').off('resize', onResize)`,
    lang: 'javascript',
  },
  one: {
    code: `// Fires exactly once, then auto-removes itself
bubble.events.topic('app').one('ready', () => {
  console.log('App ready — runs once')
  this.initPlugins()
})`,
    lang: 'javascript',
  },
  cleanup: {
    code: `export default {
  name: 'Notifications',
  data() { return { items: [] } },

  template() {
    return \`<ul><li x-for="item in items">{{ item.text }}</li></ul>\`
  },

  init() {
    // Store handler ref for later cleanup
    this._onNew = (msg) => {
      this.data.items.value = [...this.data.items.value, msg]
    }
    bubble.events.topic('notifications').on('new', this._onNew)
  },

  beforeDestroy() {
    // Remove exact reference — no ghost listeners
    bubble.events.topic('notifications').off('new', this._onNew)
    this._onNew = null
  },
}`,
    lang: 'javascript',
  },
  patternAuth: {
    code: `// AuthService.js
async login(email, password) {
  const user = await api.login(email, password)
  bubble.events.topic('auth').emit('login', user)
}

async logout() {
  await api.logout()
  bubble.events.topic('auth').emit('logout')
}

// NavBar.js
init() {
  this._onLogin  = (user) => { this.data.currentUser.value = user }
  this._onLogout = ()     => { this.data.currentUser.value = null; router.navigate('/') }
  bubble.events.topic('auth').on('login',  this._onLogin)
  bubble.events.topic('auth').on('logout', this._onLogout)
},
beforeDestroy() {
  bubble.events.topic('auth').off('login',  this._onLogin)
  bubble.events.topic('auth').off('logout', this._onLogout)
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'PubSubPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Pub / Sub Events</h1>
        <p class="lead">
          TinyBubble includes a built-in event bus for decoupled cross-component communication.
          Use named <em>topics</em> to group related events without tight dependencies.
        </p>

        <h2>Import</h2>
        <div data-code="import"></div>

        <h2>Emit</h2>
        <p><code>bubble.events.topic(name).emit(event, ...payload)</code></p>
        <div data-code="emit"></div>

        <h2>Listen</h2>
        <p><code>.on(event, callback)</code> — from any component, no hierarchy required.</p>
        <div data-code="on"></div>

        <h2>Remove a listener</h2>
        <div data-code="off"></div>

        <h2>Listen once — <code>.one()</code></h2>
        <div data-code="one"></div>

        <h2>Cleanup in beforeDestroy</h2>
        <p>Always remove listeners when a component is destroyed. Store the handler on <code>this</code> so <code>.off()</code> can remove the exact reference.</p>
        <div data-code="cleanup"></div>

        <h2>Real-world: auth events</h2>
        <div data-code="patternAuth"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/router-advanced"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Dynamic Routes</span>
          </a>
          <a href="#/api/signals"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">API Reference</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
