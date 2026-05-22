import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  import: {
    code: `// Separate entry point — keeps core bundle small
import { bubble } from 'tinybubble/events'

// Or bundled with everything (core + router + events)
import { bubble } from 'tinybubble/full'`,
    lang: 'javascript',
  },
  bubbleInstance: {
    code: `// bubble is a Bubble singleton
bubble.events         // root EventTopic
bubble.state          // plain shared-state object
bubble.getJobManager(name)  // JobManager singleton by name

// Also assigned to window.bubble for quick console access in dev`,
    lang: 'javascript',
  },
  eventTopicRef: {
    code: `// EventTopic full method list
const topic = bubble.events.topic('myTopic')

topic.on(event, callback, id?)        // register listener
topic.off(event, callback?, id?)      // remove listener
topic.emit(event, ...args)            // fire event
topic.one(event, callback)            // register single-fire listener
topic.once(event)                     // fire + remove all listeners immediately
topic.removeAllListeners()            // wipe all event listeners
topic.remove(topicName)               // delete child topic
topic.bubble(event)                   // emit + propagate to parent
topic.topic(name)                     // get/create child topic
topic.addEventListener(event, cb, id?, single?)   // low-level alias for on()
topic.removeEventListener(event, cb?, id?)        // low-level alias for off()`,
    lang: 'javascript',
  },
  jobManagerRef: {
    code: `const job = bubble.getJobManager('name')

// Methods
job.add(amt = 1, info?)     // register N pending tasks
job.start(info?)            // mark as started
job.done(amt = 1, info?)    // complete N tasks
job.reset()                 // reset data counters
job.addCallback(evt, fn)    // listen: 'start'|'add'|'done'|'check'|'finished'
job.flushCallbacks()        // remove all callbacks

// State
job.data   // { todo: number, done: number, started: boolean }`,
    lang: 'javascript',
  },
}

export default {
  name: 'ApiEventsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Events API</h1>
        <p class="lead">
          Reference for <code>tinybubble/events</code> — the pub/sub event bus and
          the JobManager utility.
        </p>

        <h2>Import</h2>
        <div data-code="import"></div>

        <h2><code>bubble</code> instance</h2>
        <div data-code="bubbleInstance"></div>

        <h2>EventTopic — full reference</h2>
        <p>
          Every call to <code>bubble.events.topic(name)</code> returns the same
          <code>EventTopic</code> instance for that name. Topics are hierarchical —
          you can nest them with <code>.topic('child')</code>.
        </p>
        <div data-code="eventTopicRef"></div>

        <table>
          <thead>
            <tr><th>Method</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>.on(event, cb, id?)</code></td><td>Register listener. Returns topic (chainable).</td></tr>
            <tr><td><code>.off(event, cb?, id?)</code></td><td>Remove by callback or ID.</td></tr>
            <tr><td><code>.emit(event, ...args)</code></td><td>Fire event, passes args to all listeners.</td></tr>
            <tr><td><code>.one(event, cb)</code></td><td>Single-fire — auto-removes after first call.</td></tr>
            <tr><td><code>.once(event)</code></td><td>Emit now + remove all listeners for that event.</td></tr>
            <tr><td><code>.removeAllListeners()</code></td><td>Remove all listeners from all events.</td></tr>
            <tr><td><code>.remove(name)</code></td><td>Delete a child topic.</td></tr>
            <tr><td><code>.bubble(event)</code></td><td>Emit + propagate up to parent topic.</td></tr>
            <tr><td><code>.topic(name)</code></td><td>Get or create a child topic.</td></tr>
          </tbody>
        </table>

        <h2>JobManager — full reference</h2>
        <p>
          Lightweight progress tracker for batched async operations.
          <code>bubble.getJobManager(name)</code> returns singletons per name.
        </p>
        <div data-code="jobManagerRef"></div>

        <table>
          <thead>
            <tr><th>Callback event</th><th>When it fires</th><th>Args</th></tr>
          </thead>
          <tbody>
            <tr><td><code>start</code></td><td>After <code>.start()</code></td><td><code>(info)</code></td></tr>
            <tr><td><code>add</code></td><td>After <code>.add(n)</code></td><td><code>(info)</code></td></tr>
            <tr><td><code>done</code></td><td>After each <code>.done()</code> batch</td><td><code>(percentComplete, info)</code></td></tr>
            <tr><td><code>check</code></td><td>After every <code>.done()</code> and <code>.start()</code></td><td><code>(percentComplete, info)</code></td></tr>
            <tr><td><code>finished</code></td><td>When <code>done ≥ todo</code></td><td>—</td></tr>
          </tbody>
        </table>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-start">
          <a href="#/api/router"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
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
