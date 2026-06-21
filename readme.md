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

### Global template helpers via globals

Register any function once and use it in every component template without importing it per-component.

```javascript
import { globals } from "tinybubble";
import { t } from "./i18n.js";

globals.t = t;
```

```html
<!-- inside any component template -->
<p>{{ t('welcome_message') }}</p>
<button :title="t('save')">Save</button>
```

Component methods, data, and props take precedence over globals with the same name.

### Loops over arrays and objects

```html
<li x-for="item in items">{{ item.label }}</li>
<li x-for="(item, index) in items">{{ index }} — {{ item.label }}</li>
<li x-for="(category, key) in categories">{{ key }} — {{ category.label }}</li>
```

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
