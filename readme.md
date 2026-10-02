# TinyBubble — micro reactive UI library

A modular reactive vanilla JavaScript UI library based on Signals, templates, routing, and optional pub/sub.

| Bundle | Includes | Gzipped |
|---|---|---|
| `tinybubble` / `dist/bubble.js` | Signals, reactivity engine, router | **~5 kb** |
| `tinybubble/events` / `dist/bubble-events.js` | Pub/sub, EventTopic, JobManager | **+1 kb** |
| `tinybubble/full` / `dist/bubble-full.js` | Everything | **~6 kb** |

## Import the library
### As an ES module from CDN
```javascript
import { createComponent } from "https://cdn.jsdelivr.net/npm/tinybubble/dist/bubble.js"
```

### Import via npm

```shell
npm i tinybubble
```

### Optional plugins from the Git dependency

The TinyBubble package includes `plugins/bubble-store/` and `plugins/bubble-translate/`. They are shipped as files, not bundled into the core, events, or full entry points.

To use the plugins from the `edge` branch, install TinyBubble first, then install the plugin packages from its local directory:

```shell
npm install github:antocorr/tinybubble#edge
npm install ./node_modules/tinybubble/plugins/bubble-store ./node_modules/tinybubble/plugins/bubble-translate
```

Install only the plugin you need if you do not use both. This selects the plugin sources included in that TinyBubble checkout; it does not fetch a separate plugin release. After updating TinyBubble, reinstall the local plugin dependencies to use the updated sources.

Import them by their own package names: `bubble-store`, `bubble-store/bubble`, and `bubble-translate/bubble`. The `tinybubble/plugins/...` paths are not exposed by TinyBubble's `exports`.

## AI FRIENDLY

Being small and relatively simple, and by pairing it with Tailwind, you can create all sorts of components using any LLM.

TinyBubble is especially AI-friendly because the whole core mental model (templating directives, signals-based reactivity, and router) is clear and small, so an LLM can keep almost the entire framework behavior in context while generating or refactoring components.

There is also a prompt ready to use here

https://github.com/antocorr/tinybubble/blob/main/ai-component-creation-prompt.md

And the agents/Claude skill is ready to use.

https://github.com/antocorr/tinybubble/tree/main/.claude/skills/tinybubble


This is a test made using GPT 5.1 with the creation prompt:

https://antocorr.github.io/tinybubble/examples/ai-bakery.html

## Using the library

### Vue/React Single File component style


```javascript
//components/MyComponent.js
export default {
    name: 'Shoryuken',
    template(){
         /*html*/
         return `
            <div>
                <div>{{ character }}</div>
                <div class="counter mt-4">
                    <p>Count: {{ counter }}</p>
                    <button class="bg-blue-500 text-white p-2" @click="increment">Increment</button>
                </div>
            </div>
          `
    },
    increment() {
        // data keys are signals
        this.data.counter.value++;
    },
    data(){
        return{
            counter: 1,
            character: 'Ken'
        }
    }
}

```


```javascript
//in your main js file
import { createComponent } from "tinybubble";
import MyComponent from "./components/MyComponent.js";
const override = { props: { counter: 5, character: 'Ryu' } };
const myComponent = createComponent(MyComponent,  override);
myComponent.appendTo(document.body);

```

### Signal style (Svelte Runes, SolidJS)

```javascript
import { html, effect, createSignal } from "tinybubble";
const counter = html(
    /*html*/
    `
        <div class="counter mt-4">
                <p>Count: <span id="count">1</span></p>
                <button class="bg-blue-500 text-white p-2" id="btn">Increment</button>
            </div>
    `);
const btn = counter.querySelector('#btn');
const count = counter.querySelector('#count');
const [getCount, setCount] = createSignal(+count.textContent);
document.getElementById('app').appendChild(counter);
effect(() => {
    count.textContent = getCount();
})
btn.onclick = () => {
    setCount(getCount() + 1);
}
```

## HTML Component library support

TinyBubble can work alongside HTML component libraries such as Shoelace.

### Comes with pub sub utilities to cross notify components

Use the built-in event bus when you need two components to talk without a direct parent/child relationship. Create a topic, emit events with a payload, and listen from any other component to keep things decoupled.

```javascript
//in any component, parent, children, sibling
import { bubble } from "tinybubble/events";

bubble.events.topic('layout').emit('resize', 'small');

//in any other component for example Sidebar.js

bubble.events.topic("layout").on('resize', (size) => {
    if(size == 'small'){
        hideSecondaryLinks();
    }
})

```

### Signals, watch, and untrack

Use `watch()` for lazy reactions to a specific source. Signals read inside the callback are not added as dependencies. Use `untrack()` when you need an untracked read inside a reactive effect.

```javascript
import { Signal, watch, effect, untrack } from "tinybubble";

const query = Signal("");
const debug = Signal(false);

watch(query, (next, prev) => {
    fetchResults(next);
});

effect(() => {
    console.log(query.value);
    untrack(() => console.log(debug.value));
});
```

### Loops over arrays and objects

```html
<li x-for="item in items">{{ item.label }}</li>
<li x-for="(item, index) in items">{{ index }} — {{ item.label }}</li>
<li x-for="(category, key) in categories">{{ key }} — {{ category.label }}</li>
```

#### Keyed loops

By default `x-for` re-renders the whole list on any change. Add a `:key` to reconcile by key instead: reused items keep their DOM nodes, child component state, focus, and unmanaged input values across reorders. The item is exposed as a signal, so bindings update in place when the same key receives new data.

```html
<li x-for="item in items" :key="item.id">{{ item.label }}</li>
<li x-for="(item, index) in items" :key="item.id">{{ index }} — {{ item.label }}</li>
```

`:key` is optional — omit it to keep the simple full re-render behavior. It applies to array loops.


### Global template helpers

Register a function once and use it in every component template — no per-component import needed.

Use `registerHelper` for utility functions you want to call with the `$` prefix convention:

```javascript
import { registerHelper } from "tinybubble";

registerHelper('formatDateTime', (value) =>
    new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
);

registerHelper('formatCurrency', (value, currency = 'EUR') =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value)
);
```

```html
<!-- inside any component template, including child components -->
<span>{{ $formatDateTime(tournament.joinClosesAt) }}</span>
<span>{{ $formatCurrency(tournament.prizePool) }}</span>
```

The `$` prefix is added automatically if omitted from the name. You can also pass `$name` directly — both forms are equivalent.

Helper functions registered with `registerHelper` are also available inside component methods as `this.$name(...)`:

```javascript
const MyComponent = {
    buildSummary() {
        // this.$formatDateTime and this.$formatCurrency available here too
        return this.data.tournaments.value.map(t =>
            `${t.name}: ${this.$formatDateTime(t.startsAt)} — ${this.$formatCurrency(t.prizePool)}`
        ).join('\n');
    }
};
```

For plain globals without the `$` convention (e.g. an i18n `t()` function), use the `globals` object directly:

```javascript
import { globals } from "tinybubble";
import { t } from "./i18n.js";

globals.t = t;
```

```html
<p>{{ t('welcome_message') }}</p>
```

Component methods, data, and props always take precedence over globals, so there are no accidental overrides.

See the full working example: [`examples/reactivity/helpers.html`](examples/reactivity/helpers.html)

### Translation — bubble-translate plugin

`bubble-translate` provides translations, language-file caching, and `%s` placeholders. Install it using the [plugin installation steps](#optional-plugins-from-the-git-dependency) above.

For TinyBubble, use the `/bubble` integration to register `globals.t` and make template translations reactive to language changes:

```javascript
import { createComponent, globals } from 'tinybubble';
import { createTranslate } from 'bubble-translate/bubble';
import App from './components/App.js';

const t = createTranslate({
    defaultLang: 'en',
    storageKey: 'app.lang',
    url: (lang) => `./localization/${lang}.json`,
});

await t.setLang(t.lang);
createComponent(App).appendTo(document.getElementById('app'));

// Switch language from application code.
await globals.t.setLang('it');
```

```html
<!-- Inside a component template. -->
<p>{{ t('Welcome') }}</p>
<p>{{ t('Hello %s', name) }}</p>
```

Language files are JSON objects mapping messages to translations. Missing messages fall back to the original text. Use `bubble-translate` for the framework-independent translator, or `bubble-translate/vue` for the Vue integration (requires Vue).

### State management — bubble-store plugin

`bubble-store` is an optional plugin that brings Redux-style state management with full Signal integration. Install it using the [plugin installation steps](#optional-plugins-from-the-git-dependency) above.

**What it includes:**
- `createStore(rootReducer, initialState, devtools?)` — Redux-like store with optional Redux DevTools support
- `createSelector` / `createSelectorFactory` / `createStructuredSelector` — memoized selectors (Reselect-inspired)
- `createBubbleStore(store)` — bridge that wires any Redux-like store into tinybubble's Signal reactivity
- `connectStore(componentDef, mapStateToData)` — HOC that binds a component to the store

**Setup (`store.js`) — once per project:**

```javascript
import { createStore }       from 'bubble-store';
import { createBubbleStore } from 'bubble-store/bubble';
import rootReducer            from './reducers/index.js';

const store = createStore(rootReducer, {});
export const { connectStore, dispatch, getState } = createBubbleStore(store);
```

**Using `connectStore` in a component:**

```javascript
import { connectStore, dispatch } from './store.js';
import { selectCartCount }        from './selectors/cart.selectors.js';

export default connectStore({
    data() { return { cartCount: 0, items: [] }; },

    template() {
        return `<div>
            <span>{{cartCount}} items in cart</span>
            <div x-for="item in items">
                <span>{{item.name}}</span>
                <button @click="this.remove(item)">Remove</button>
            </div>
        </div>`;
    },

    remove(item) {
        dispatch({ type: 'CART_REMOVE', payload: item.id });
    },

}, (state) => ({
    cartCount: selectCartCount(state),
    items:     state.cart.items,
}));
```

**How reactivity works:** on every store dispatch, `mapStateToData` is called. Changed values are written into the component's Signal objects. Tinybubble's effect system re-renders only the DOM nodes that depend on those signals — no polling, no manual updates.

**Per-instance selectors** for parametric lookups (e.g. finding one item by ID in a list):

```javascript
import { createSelectorFactory, createSelector } from 'bubble-store';

// Define once
export const makeItemByIdSelector = createSelectorFactory(() =>
    createSelector(
        state => state.cart.items,
        (state, id) => id,
        (items, id) => items.find(i => i.id === id) ?? null
    )
);

// In the component — each instance gets its own memoization cache
export default connectStore({
    props: ['itemId'],
    data() { return { item: null }; },
    init() { this._select = makeItemByIdSelector(); },
}, (state, component) => ({
    item: component._select?.(state, component.props.itemId),
}));
```

See the full working example: [`examples/store/pizzeria.html`](examples/store/pizzeria.html)

### Easy routing included

TinyBubble ships with a tiny router so you can wire navigation without extra deps. Declare your routes, drop `<router-link>` and `<router-view>` into your layout, and TinyBubble handles hash/history navigation plus optional persistent pages.

```javascript
// router.js
import { createRouter } from "tinybubble";
import Home from "./pages/Home.js";
import About from "./pages/About.js";

export const router = createRouter({
  mode: "hash",
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: About },
    // keep this page warm in memory when you leave it
    { path: "/dashboard", component: Home, persistent: true },
  ],
});
```

```javascript
// App.js
import { createComponent } from "tinybubble";
import { router } from "./router.js";

export default {
  name: "App",
  template() {
    /*html*/
    return `
      <div>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/dashboard">Dashboard</router-link>
        </nav>
        <main>
          <router-view></router-view>
        </main>
      </div>
    `;
  },
  components: {
    "router-link": router.RouterLink,
    "router-view": router.RouterView,
  },
};
```

### Dynamic routes

`routes` also accepts a function instead of an array. It's re-evaluated on every route resolution, so it can react to signals (e.g. auth state) without any extra router API:

```javascript
export const router = createRouter({
  routes: () => isLoggedIn.value
    ? [...publicRoutes, ...privateRoutes]
    : publicRoutes,
});
```

Reading a signal inside the function makes route resolution reactive to it — routes update even without navigating, since the function runs inside the router's own effect.

### Component lazy loading

Keep the bundle tiny by loading components only when needed. You can lazy load router pages via a `src` property, or manually import any component at runtime with `importComponent`.

For Vite builds, prefer static imports with `component:` routes so the bundler can analyze dependencies. The `src` route form is useful for CDN/no-build setups.

```javascript
// Lazy route: only fetched when the user navigates to /async
export const router = createRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/async", src: "./pages/AsyncPage.js" },
  ],
});
```

```javascript
// Lazy widget anywhere else
import { importComponent } from "tinybubble";

async function mountWidget(host) {
  const src = new URL("./components/ChartWidget.js", import.meta.url).href;
  const widget = await importComponent(src);
  widget.appendTo(host);
}
```

## Examples

basic example: https://antocorr.github.io/tinybubble/examples/reactivity/basic.html

effect example: https://antocorr.github.io/tinybubble/examples/reactivity/effect.html

example: https://antocorr.github.io/tinybubble/examples/reactivity/shoelace.html

router: https://antocorr.github.io/tinybubble/examples/router/index.html
