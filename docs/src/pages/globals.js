import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  register: {
    code: `// main.js — run once at startup
import { globals } from 'tinybubble'
import { formatDate, formatCurrency } from './utils/format.js'
import { t } from './i18n.js'

globals.t              = t
globals.formatDate     = formatDate
globals.formatCurrency = formatCurrency
globals.appName        = 'MyApp'`,
    lang: 'javascript', filename: 'main.js',
  },
  useInTemplate: {
    code: `<!-- Any component template — no imports needed -->
<p>{{ t('welcome') }}</p>
<time>{{ formatDate(createdAt) }}</time>
<strong>{{ formatCurrency(price, 'EUR') }}</strong>

<!-- In attribute bindings -->
<img :alt="t('user_avatar')" :src="avatarUrl" />`,
    lang: 'html',
  },
  reactiveGlobals: {
    code: `import { globals, Signal } from 'tinybubble'

// $ prefix + SignalObject → reactive property on every component instance
globals.$theme = Signal('light')

// Read in templates as {{ $theme }} — reactively updated
// Change anywhere:
globals.$theme.value = 'dark'
// All templates referencing {{ $theme }} update automatically`,
    lang: 'javascript',
  },
  i18nSetup: {
    code: `// i18n.js
import { globals, Signal } from 'tinybubble'

const messages = {
  en: { welcome: 'Welcome!', save: 'Save', cancel: 'Cancel' },
  it: { welcome: 'Benvenuto!', save: 'Salva', cancel: 'Annulla' },
}

export const $lang = Signal('en')
globals.$lang = $lang

export function t(key) {
  return messages[$lang.value]?.[key] ?? key
}

globals.t = t`,
    lang: 'javascript', filename: 'i18n.js',
  },
  i18nUsage: {
    code: `<!-- Any component template — templates re-evaluate when $lang changes -->
<h1>{{ t('welcome') }}</h1>
<button>{{ t('save') }}</button>
<button>{{ t('cancel') }}</button>

<!-- Language switcher -->
<select @change="switchLang($event.target.value)">
  <option value="en">English</option>
  <option value="it">Italiano</option>
</select>

// In component method
import { $lang } from '../i18n.js'
switchLang(lang) { $lang.value = lang }`,
    lang: 'javascript',
  },
  precedence: {
    code: `// globals.t = translationFn  (registered globally)

export default {
  name: 'SpecialComp',
  data() {
    return { t: 'local string named t' }  // shadows globals.t inside this component
  },
  template() {
    return \`
      <p>{{ t }}</p>        <!-- local data.t, not globals.t -->
      <p>{{ appName }}</p>  <!-- globals.appName still available ✅ -->
    \`
  },
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'GlobalsPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Globals</h1>
        <p class="lead">
          The <code>globals</code> object lets you register functions and values available in every
          component template — no per-component import needed.
        </p>

        <h2>Registering globals</h2>
        <div data-code="register"></div>

        <h2>Using in templates</h2>
        <div data-code="useInTemplate"></div>

        <h2>Reactive globals (<code>$</code> prefix)</h2>
        <p>
          A key starting with <code>$</code> whose value is a <code>SignalObject</code> is exposed as
          a reactive property on every component instance. This is how <code>$route</code> works.
        </p>
        <div data-code="reactiveGlobals"></div>

        <h2>i18n example</h2>
        <p>Register a translation function <code>t</code> and pair it with a reactive <code>$lang</code> signal for hot language switching.</p>
        <div data-code="i18nSetup"></div>
        <div data-code="i18nUsage"></div>

        <h2>Precedence</h2>
        <p>Component <code>data</code>, <code>props</code>, and methods always shadow globals with the same name.</p>
        <div data-code="precedence"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/components"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Component System</span>
          </a>
          <a href="#/guide/router"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Router</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
