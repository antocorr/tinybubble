import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  get: {
    code: `import { bubble } from 'tinybubble/events'

// Get (or create) a named job manager — singletons per name
const uploadJob   = bubble.getJobManager('upload')
const syncJob     = bubble.getJobManager('data-sync')`,
    lang: 'javascript',
  },
  usage: {
    code: `const job = bubble.getJobManager('import')

// 1. Tell the manager how many tasks to expect
job.add(10)        // 10 items to process

// 2. Start tracking
job.start()

// 3. As each task completes, call done()
for (const item of items) {
  await processItem(item)
  job.done()       // done(1) by default; pass an amount to batch: job.done(3)
}

// 'finished' fires automatically when done >= todo`,
    lang: 'javascript',
  },
  callbacks: {
    code: `const job = bubble.getJobManager('upload')

// 'start'    — job.start() called
job.addCallback('start', () => showSpinner())

// 'add'      — job.add(n) called; receives (info)
job.addCallback('add', (info) => console.log('added tasks', info))

// 'done'     — a batch completed; receives (percentComplete, info)
job.addCallback('done', (pct, info) => updateProgressBar(pct))

// 'check'    — called after every done() or start(); receives (percentComplete, info)
job.addCallback('check', (pct) => console.log(pct.toFixed(1) + '%'))

// 'finished' — todo reached, all tasks complete
job.addCallback('finished', () => {
  hideSpinner()
  showSuccessToast()
})`,
    lang: 'javascript',
  },
  reset: {
    code: `// Reset counters and started state (does NOT flush callbacks)
job.reset()

// Remove all callbacks
job.flushCallbacks()`,
    lang: 'javascript',
  },
  component: {
    code: `import { bubble } from 'tinybubble/events'

export default {
  name: 'UploadProgress',
  data() { return { progress: 0, done: false } },

  template() {
    return \`
      <div x-if="!done">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        <p>{{ progress.toFixed(0) }}%</p>
      </div>
    \`
  },

  init() {
    const job = bubble.getJobManager('upload')

    job.addCallback('done', (pct) => {
      this.data.progress.value = pct
    })

    job.addCallback('finished', () => {
      this.data.done.value = true
    })
  },
}

// Elsewhere — the actual upload logic
async function uploadFiles(files) {
  const job = bubble.getJobManager('upload')
  job.reset()
  job.add(files.length)
  job.start()

  for (const file of files) {
    await uploadFile(file)
    job.done()
  }
}`,
    lang: 'javascript',
  },
  apiShape: {
    code: `// JobManager API shape
{
  // State
  data: { todo: number, done: number, started: boolean }

  // Methods
  add(amt = 1, info?)       // register N tasks
  start(info?)              // mark as started, triggers 'check'
  done(amt = 1, info?)      // complete N tasks, triggers 'done' + 'check' + maybe 'finished'
  reset()                   // reset data counters (not callbacks)

  // Callbacks
  addCallback(event, fn)    // 'start' | 'add' | 'done' | 'check' | 'finished'
  flushCallbacks()          // remove all callbacks
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'JobManagerPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>JobManager</h1>
        <p class="lead">
          <code>bubble.getJobManager(name)</code> returns a named singleton for tracking
          batched async operations — uploads, imports, sync queues — with progress callbacks.
        </p>

        <h2>Getting a manager</h2>
        <p>Calling <code>getJobManager</code> with the same name always returns the same instance.</p>
        <div data-code="get"></div>

        <h2>Basic usage</h2>
        <div data-code="usage"></div>

        <h2>Callbacks</h2>
        <p>Register callbacks for lifecycle events. Multiple callbacks per event are supported.</p>
        <div data-code="callbacks"></div>

        <h2>Reset &amp; flush</h2>
        <div data-code="reset"></div>

        <h2>API shape</h2>
        <div data-code="apiShape"></div>

        <h2>Component example — upload progress bar</h2>
        <div data-code="component"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/eventtopic"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">EventTopic API</span>
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
