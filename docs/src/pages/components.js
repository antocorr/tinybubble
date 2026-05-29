import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  anatomy: {
    code: `export default {
  name: 'MyCard',
  compId: 'my-card',            // de-dupe inline CSS
  props: ['title', 'subtitle'],   // declared props
  emits: ['select', 'close'],     // declared emits

  style() {
    return \`
      .my-card { border-radius: 12px; }
    \`
  },

  data() {
    return { expanded: false }    // each key → Signal
  },

  template() {
    return \`
      <div class="card">
        <h2>{{ title }}</h2>
        <p x-show="expanded">{{ subtitle }}</p>
        <button @click="toggle">Toggle</button>
      </div>
    \`
  },

  toggle() {
    this.data.expanded.value = !this.data.expanded.value
  },

  // Lifecycle
  init()          { /* after binding, before DOM insertion */ },
  mounted()       { /* after appendTo() */ },
  beforeDestroy() { /* before effects are disposed */ },
  destroy()       { /* after effects are disposed */ },
}`,
    lang: 'javascript', filename: 'components/MyCard.js',
  },
  createComponent: {
    code: `import { createComponent } from 'tinybubble'
import MyCard from './components/MyCard.js'

// Basic
const card = createComponent(MyCard)
card.appendTo(document.getElementById('app'))

// With initial props
const card2 = createComponent(MyCard, { props: { title: 'Hello', subtitle: 'World' } })
card2.appendTo(document.body)

// Access the DOM element
console.log(card.$element)   // HTMLElement`,
    lang: 'javascript',
  },
  data: {
    code: `export default {
  data() {
    return {
      name:  'Alice',
      email: '',
      tags:  ['vue', 'react'],
    }
  },
  submit() {
    const name = this.data.name.value       // read
    this.data.name.value = 'Bob'            // write
    this.data.tags.value = [...this.data.tags.value, 'solidjs']  // update array
  },
}`,
    lang: 'javascript',
  },
  props: {
    code: `// Badge.js
export default {
  name: 'Badge',
  props: ['label', 'color', 'count'],
  template() {
    return \`
      <span class="badge" :class="'badge-' + color">
        {{ label }}
        <sup x-if="count > 0">{{ count }}</sup>
      </span>
    \`
  },
}`,
    lang: 'javascript', filename: 'components/Badge.js',
  },
  propsPass: {
    code: `// Via createComponent
const badge = createComponent(Badge, { props: { label: 'New', color: 'green', count: 3 } })
badge.appendTo(container)`,
    lang: 'javascript',
  },
  propsReactive: {
    code: `<!-- :label passes the signal — child updates automatically -->
<badge-comp :label="currentLabel" :count="unreadCount" />`,
    lang: 'html',
  },
  emitsChild: {
    code: `// ConfirmDialog.js
export default {
  name: 'ConfirmDialog',
  props: ['message'],
  emits: ['confirm', 'cancel'],
  template() {
    return \`
      <div class="dialog">
        <p>{{ message }}</p>
        <button @click="onConfirm">Yes</button>
        <button @click="onCancel">No</button>
      </div>
    \`
  },
  onConfirm() { this.emit('confirm') },
  onCancel()  { this.emit('cancel') },
}`,
    lang: 'javascript', filename: 'components/ConfirmDialog.js',
  },
  emitsParent: {
    code: `// Parent
export default {
  name: 'App',
  components: { 'confirm-dialog': ConfirmDialog },
  data() { return { show: false } },
  template() {
    return \`
      <div>
        <button @click="this.data.show.value = true">Delete</button>
        <confirm-dialog
          x-if="show"
          message="Are you sure?"
          @confirm="onConfirm"
          @cancel="this.data.show.value = false"
        />
      </div>
    \`
  },
  onConfirm() {
    this.data.show.value = false
    doDelete()
  },
}`,
    lang: 'javascript',
  },
  lifecycle: {
    code: `export default {
  name: 'Clock',
  data() { return { time: new Date().toLocaleTimeString() } },
  template() { return \`<time>{{ time }}</time>\` },

  init() {
    // runs during createComponent — before DOM insertion
    this._interval = setInterval(() => {
      this.data.time.value = new Date().toLocaleTimeString()
    }, 1000)
  },

  mounted() {
    // runs after appendTo() — element is in the real DOM
    console.log('Clock is visible at', this.$element.getBoundingClientRect())
  },

  beforeDestroy() {
    clearInterval(this._interval)
  },
}`,
    lang: 'javascript',
  },
  styles: {
    code: `export default {
  name: 'ProfileCard',
  compId: 'profile-card',

  // Inline CSS. Injected once per compId into document.head.
  style() {
    return \`
      .profile-card {
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 16px;
      }
    \`
  },

  // External CSS. Appended once per stable URL as a <link rel="stylesheet">.
  styleURL: new URL('./ProfileCard.css', import.meta.url).href,

  template() {
    return \`
      <article class="profile-card">
        <h2>{{ name }}</h2>
      </article>
    \`
  },

  data() { return { name: 'Ken' } },
}`,
    lang: 'javascript', filename: 'components/ProfileCard.js',
  },
  childComp: {
    code: `import Avatar from './Avatar.js'
import Badge from './Badge.js'

export default {
  name: 'UserCard',
  components: {
    'user-avatar': Avatar,
    'notif-badge': Badge,
  },
  data() { return { user: { name: 'Alice', avatar: '/img/alice.jpg', notifications: 3 } } },
  template() {
    return \`
      <div class="card">
        <user-avatar :src="user.avatar" :alt="user.name" />
        <span>{{ user.name }}</span>
        <notif-badge :count="user.notifications" />
      </div>
    \`
  },
}`,
    lang: 'javascript',
  },
  watchProp: {
    code: `import { watchProp } from 'tinybubble'

export default {
  name: 'Chart',
  props: ['dataset'],
  init() {
    watchProp(this, 'dataset', (newData, oldData) => {
      this.redraw(newData)
    })
    this.redraw(this.props.dataset)
  },
  redraw(data) { /* update canvas */ },
}`,
    lang: 'javascript',
  },
  destroy: {
    code: `const modal = createComponent(Modal)
modal.appendTo(document.body)

// Later:
modal.$destroy()
// → beforeDestroy() runs, effects disposed, destroy() runs`,
    lang: 'javascript',
  },
  importComp: {
    code: `import { importComponent } from 'tinybubble'

async function mountWidget(host) {
  const widget = await importComponent('./components/Chart.js', {
    props: { dataset: myData }
  })
  widget.appendTo(host)
}

// Module is cached after first import
await importComponent('./components/Chart.js')  // no extra network request`,
    lang: 'javascript',
  },
}

export default {
  name: 'ComponentsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Component System</h1>
        <p class="lead">
          A TinyBubble component is a plain JavaScript object — no class syntax, no decorators.
          Just data, methods, and a template string.
        </p>

        <h2>Anatomy</h2>
        <div data-code="anatomy"></div>

        <h2>createComponent</h2>
        <p>Instantiates a component. Returns an object with <code>$element</code> and <code>appendTo(target)</code>.</p>
        <div data-code="createComponent"></div>

        <h2>data — reactive state</h2>
        <p>Each key in <code>data()</code> is automatically wrapped in a Signal and stored in <code>this.data</code>.</p>
        <div data-code="data"></div>

        <h2>props</h2>
        <p>
          Declare accepted props with the <code>props</code> array.
          In templates use <code>{<wbr>{ propName }<wbr>}</code>, in methods use <code>this.props.propName</code>
          (already unwrapped — never <code>.value</code>).
        </p>
        <div data-code="props"></div>

        <h3>Passing props via createComponent</h3>
        <div data-code="propsPass"></div>

        <h3>Reactive binding in templates</h3>
        <div data-code="propsReactive"></div>

        <h2>emit — component events</h2>
        <p>Declare emittable events in <code>emits</code> and fire them with <code>this.emit(name, ...args)</code>.</p>
        <div data-code="emitsChild"></div>
        <p>Parent listens with <code>@eventName</code> on the component tag:</p>
        <div data-code="emitsParent"></div>

        <h2>Lifecycle hooks</h2>
        <div data-code="lifecycle"></div>

        <h2>style and styleURL</h2>
        <p>
          Use <code>style</code> for component CSS and <code>styleURL</code> for an external stylesheet.
          Both are processed when the component is created and injected into <code>document.head</code>.
        </p>
        <div data-code="styles"></div>
        <p>
          Add a stable <code>compId</code> when using <code>style</code>, so TinyBubble does not inject
          the same inline CSS more than once. For <code>styleURL</code>, use a stable URL string for shared CSS.
          Use reactive <code>:class</code> or <code>:style</code> for state-dependent visual changes.
        </p>

        <h2>Child components</h2>
        <p>Register sub-components in the <code>components</code> map. Key = lowercase hyphenated tag name.</p>
        <div data-code="childComp"></div>

        <h2>watchProp</h2>
        <p>React to a specific prop change inside <code>init()</code>.</p>
        <div data-code="watchProp"></div>

        <h2>$destroy</h2>
        <div data-code="destroy"></div>

        <h2>importComponent — lazy loading</h2>
        <p>Load and instantiate a component module asynchronously. The import is cached after the first load.</p>
        <div data-code="importComp"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/templating"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Templating</span>
          </a>
          <a href="#/guide/globals"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Globals</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
