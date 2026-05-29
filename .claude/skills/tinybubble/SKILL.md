---
name: tinybubble
description: TinyBubble component/page authoring, props-emits wiring, router usage, pub-sub topic lifecycle, JobManager, globals, and plugin integration (especially bubble-translate). Always apply for files ending in .bub.js or .bubble.js, and for any TinyBubble UI task including reactivity, signals, templating, routing, or events.
license: MIT
metadata:
  author: antocorr
  tags: tinybubble, components, props, emits, pubsub, router, signals, reactivity, globals, i18n, bubble-translate
---

# TinyBubble

## When To Apply

Apply when the request involves:
- New TinyBubble component/page creation or refactor (`.bub.js`, `.bubble.js`, any component file)
- Signal/effect/computed/watch usage
- Child component registration with props/emits
- Fixing `this.props.foo.value` and template binding mistakes
- Event topic wiring, listener cleanup, or pub-sub refactor
- JobManager usage
- TinyBubble router setup or route updates
- Globals wiring (`globals.t`, `globals.$lang`, `$route`, custom `$`-signals)
- TinyBubble translation wiring (`globals.t`, `i18nLang`, language switch)
- Work inside `plugins/bubble-translate/`

**Auto-trigger:** always activate for files ending `.bub.js` or `.bubble.js`.

---

## Source Of Truth For This Repo

When in doubt, align to these runtime files:
- `src/lib/Reactivity.js`  — createComponent, html, globals, bindNode
- `src/lib/Signals.js`     — Signal, effect, watch, computed, tick, collectEffects
- `src/lib/Router.js`      — createRouter, RouterLink, RouterView
- `src/lib/EventTopic.js`  — EventTopic (used by bubble.events)
- `src/lib/Bubble.js`      — bubble singleton, getJobManager
- `src/lib/JobManager.js`  — JobManager
- `plugins/bubble-translate/bubble.js`
- `plugins/bubble-translate/index.js`

---

## 1. Bundles

TinyBubble ships as three separate entry points:

| Bundle | Includes | Gzipped |
|---|---|---|
| `tinybubble` / `dist/bubble.js` | Signals, reactivity, router | ~5 kb |
| `tinybubble/events` / `dist/bubble-events.js` | Pub/sub, EventTopic, JobManager | +1 kb |
| `tinybubble/full` / `dist/bubble-full.js` | Everything | ~6 kb |

**Caveat:** pub/sub (`bubble`) is NOT included in the core bundle. Import it separately.

```js
import { createComponent, createRouter, Signal, effect, watch, computed, tick,
         collectEffects, html, importComponent, watchProp, globals } from 'tinybubble'
import { bubble } from 'tinybubble/events'
```

---

## 2. Component Shape

```js
export default {
    name: "MyComponent",
    props: ["title"],          // declare accepted props
    emits: ["select"],         // declare emittable events
    components: {              // register child components
        "child-comp": ChildComp,
    },

    template() {
        return /*html*/`
        <section>
            <h2>{{ title }}</h2>
            <button type="button" @click="increment">+1</button>
            <p>{{ count }}</p>
        </section>
        `;
    },

    data() {
        return { count: 0 };   // each key → Signal
    },

    increment() {
        this.data.count.value += 1;
    },

    // Lifecycle (in order)
    init()          { /* after binding, before DOM insertion  */ },
    mounted()       { /* after appendTo() — element in DOM   */ },
    beforeDestroy() { /* before effects disposed             */ },
    destroy()       { /* after effects disposed              */ },
};
```

Rules:
- `template()` returns one root element
- State writes: `this.data.key.value = next`
- Methods are auto-bound to `this`
- `/*html*/` before the template literal enables editor syntax highlighting

---

## 3. Reactive Bindings

| Syntax | Use for |
|---|---|
| `{{ expr }}` | Text interpolation |
| `:attr="expr"` | Reactive attribute |
| `:class="{ active: cond }"` | Class object |
| `:class="['a', cond ? 'b' : '']"` | Class array |
| `:style="{ color: tone, fontSize: size + 'px' }"` | Object style |
| `:style="'color:' + tone"` | String style |
| `:disabled="isLoading"` | Boolean attr (removed when falsy) |
| `@click="method"` | Event handler (bare method ref) |
| `@click="doSomething(item)"` | Event handler with args |
| `@submit-prevent="onSubmit"` | Event + preventDefault |
| `@input="onInput($event)"` | Pass native event explicitly |
| `x-if="expr"` | Conditional mount/unmount |
| `x-show="expr"` | Toggle display:none |
| `x-hide="expr"` | Inverse of x-show |
| `x-model="field"` | Two-way input binding |
| `x-model="obj.field"` | Two-way nested binding |
| `x-for="item in items"` | Loop |
| `x-for="(item, index) in items"` | Loop with index |
| `ref="name"` | DOM ref → `this.refs.name` |

**Critical caveats:**
- `attr="{{signal}}"` does NOT create reactive attributes — always use `:attr="expr"`
- In templates use `{{ foo }}`, not `{{ props.foo }}`
- `class` and `style` accumulate: static base is preserved, `:class`/`:style` appends on re-render
- For `@input` and `@change`, bare handlers receive `(newValue, oldValue)` — use `$event` for the DOM event
- **`{{ }}` in prose HTML:** if a template contains `{{ }}` as literal display text (not a binding), TinyBubble will try to evaluate it. Use `{<wbr>{ expr }<wbr>}` to break the pattern without changing visual output
- Use `<template x-if="...">` to conditionally render multiple sibling elements without a wrapper div

---

## 4. Signals API

```js
import { Signal, createSignal, effect, watch, computed, tick, collectEffects } from 'tinybubble'

const count = Signal(0)                          // SignalObject
count.value = 1                                  // write
count.value                                      // read

const [get, set] = createSignal(0)               // getter/setter tuple
effect(() => { el.textContent = count.value })   // auto-tracks, re-runs on change
watch(count, (next, prev) => fetchData(next))    // lazy — skips first run
const double = computed(() => count.value * 2)  // derived signal

tick()                                           // flush pending effects synchronously (useful in tests)

const disposers = collectEffects(() => {         // collect dispose fns
    effect(() => { ... })
})
disposers.forEach(d => d())                      // tear down all at once
```

**Object signals:** assigning an object wraps it in a Proxy — direct property mutations are tracked:
```js
const user = Signal({ name: 'Alice' })
user.value.name = 'Bob'   // ✅ tracked
```

---

## 5. Props And Emits

Child component:

```js
export default {
    name: "ChildCard",
    props: ["userId", "label"],
    emits: ["save"],
    template() {
        return /*html*/`
        <article>
            <h3>{{ label }}</h3>
            <p>User: {{ userId }}</p>
            <button type="button" @click="onSave">Save</button>
        </article>
        `;
    },
    onSave() {
        this.emit("save", { id: this.props.userId });  // this.props.foo already unwrapped
    }
};
```

Parent wiring:

```html
<child-card :user-id="activeUserId" :label="'User: ' + name" @save="handleSave"></child-card>
```

Rules:
- `this.props.foo` is already unwrapped — **never** `this.props.foo.value`
- In template use `{{ foo }}` — **never** `{{ props.foo }}`
- Declare every emitted event in `emits`
- Listener name must match exactly (case-sensitive)
- Passing `:prop="sigName"` where `sigName` is a SignalObject passes the signal itself — child updates reactively

To react to prop changes:

```js
import { watchProp } from "tinybubble";

export default {
    props: ["userId"],
    init() {                            // use init(), not mounted() — props ready from here
        watchProp(this, "userId", (newVal, oldVal) => {
            this.loadUser(newVal);
        });
        this.loadUser(this.props.userId);   // load on first mount too
    },
};
```

---

## 6. Globals

`globals` is merged into every component's template scope — no per-component import needed.

```js
import { globals, Signal } from 'tinybubble'

globals.t           = translationFn          // {{ t('key') }} in any template
globals.formatDate  = (d) => d.toISOString() // {{ formatDate(createdAt) }} anywhere

// $ prefix + SignalObject → reactive property on every component instance
globals.$theme = Signal('light')             // {{ $theme }} reactive in any template
// globals.$route is set automatically by createRouter()
```

**Precedence:** component `data`, `props`, and methods shadow globals with the same name.

---

## 7. Router

```js
import { createRouter } from "tinybubble";
import Home    from "./pages/Home.js";
import About   from "./pages/About.js";
import NotFound from "./pages/NotFound.js";

export const router = createRouter({
    mode: "hash",                        // "hash" | "history"
    base: "/",
    srcBase: import.meta.url,            // needed for lazy src: routes
    routes: [
        { path: "/",           component: Home },
        { path: "/about",      component: About },
        { path: "/user/:id",   component: UserPage },    // dynamic param
        { path: "/docs/:slug?", component: DocsPage },  // optional param
        { path: "/dash",       component: Dash, persistent: true },
        { path: "/lazy",       src: "./pages/Lazy.js" }, // lazy-loaded
        { path: "*",           component: NotFound }
    ]
});
```

App registration:

```js
components: {
    "router-link": router.RouterLink,
    "router-view": router.RouterView
}
```

```html
<router-link to="/about">About</router-link>
<router-link to="/user/42" :class="{ active: $route.path === '/user/42' }">Profile</router-link>
<router-view></router-view>
```

`$route` is a reactive global set by `createRouter`:
```js
{{ $route.path }}        // current path — reactive in any template
{{ $route.params.id }}   // dynamic param
{{ $route.query.tab }}   // query string
```

**Caveats:**
- Register `router-link` and `router-view` in the `components` map of every component that uses them
- `persistent: true` keeps the component alive in memory when navigating away
- Programmatic navigation: `router.navigate("/path")`
- **Vite builds + `src:` routes:** Vite cannot analyze runtime-computed `import()` URLs. Use static `import` + `component:` when building with Vite. The `src:` approach works fine in CDN/no-build setups.

---

## 8. PubSub Lifecycle

```js
import { bubble } from "tinybubble/events";  // NOT in core bundle

export default {
    init() {
        this._onItem = (payload) => this.handleItem(payload);
        bubble.events.topic("cart").on("item:added", this._onItem);
    },
    beforeDestroy() {
        bubble.events.topic("cart").off("item:added", this._onItem);
        this._onItem = null;
    },
    handleItem(payload) { /* ... */ }
};
```

EventTopic full API:
```js
const t = bubble.events.topic("name")
t.on(event, cb, id?)         // register listener
t.off(event, cb?, id?)       // remove by ref or id
t.emit(event, ...args)       // fire
t.one(event, cb)             // single-fire (auto-removes after first call)
t.once(event)                // emit now + remove all listeners for that event
t.removeAllListeners()       // wipe all listeners on topic
t.remove("childTopic")       // delete child topic
t.bubble(event)              // emit + propagate to parent topic
```

**bubble.state** — plain shared object, no reactivity:
```js
bubble.state.user = { id: 42 }
```

Rules:
- API is `bubble.events.topic("name")` — never `bubble.topic("name")`
- Store handler refs on `this` — anonymous callbacks cannot be removed with `.off()`
- Detach before re-register in repeated `init()` paths (prevents duplicate callbacks)
- Prefer structured payloads: `topic.emit("event", { ... })`

---

## 9. JobManager

```js
import { bubble } from "tinybubble/events";

const job = bubble.getJobManager("upload")   // singleton per name

job.add(10)           // 10 tasks to do
job.start()           // mark as started
job.done()            // complete 1 task
job.done(3)           // complete 3 at once
job.reset()           // reset counters (not callbacks)
job.flushCallbacks()  // remove all callbacks

job.addCallback("finished", () => showSuccess())
job.addCallback("done",     (pct, info) => updateBar(pct))
job.addCallback("check",    (pct) => console.log(pct + "%"))
// events: 'start' | 'add' | 'done' | 'check' | 'finished'
```

---

## 10. bubble-translate Plugin

Use `plugins/bubble-translate/bubble.js` for TinyBubble apps.

### Bootstrap once

```js
import { createComponent } from "tinybubble";
import { createTranslate } from "./plugins/bubble-translate/bubble.js";
import App from "./components/App.bubble.js";

const t = createTranslate({
    defaultLang: "en_EN",
    storageKey: "app.lang",
    url: (lang) => `./localization/${lang}.json`
});

await t.setLang(t.lang);

const app = createComponent(App);
app.appendTo(document.getElementById("app"));
```

What this gives you:
- `globals.t` registered automatically
- `globals.i18nLang` signal kept in sync on `t.setLang(...)`
- `{{ t('key') }}` in any template updates reactively on language change

### In components

```js
import { globals } from "tinybubble";

export default {
    data() { return { currentLang: "en_EN" } },
    async switchLanguage(lang) {
        await globals.t.setLang(lang);
        this.data.currentLang.value = globals.t.lang;
    },
    template() {
        return /*html*/`
        <section>
            <h2>{{ t('Welcome') }}</h2>
            <button @click="switchLanguage('it_IT')">{{ t('Italian') }}</button>
        </section>
        `;
    }
};
```

Guidelines:
- Initialize translate once at app bootstrap, not per component
- In JS methods use `globals.t(...)` — bare `t(...)` only works inside templates
- `%s` placeholders are positional: `t("Hi %s", userName)`
- Fallback is the key itself when translation is missing

---

## Migration Checklist

| Old | New |
|---|---|
| `this.props.foo.value` | `this.props.foo` |
| `{{ props.foo }}` | `{{ foo }}` |
| `bubble.topic("x")` | `bubble.events.topic("x")` |
| `src="{{imageUrl}}"` | `:src="imageUrl"` |
| `watchProp` in `mounted()` | `watchProp` in `init()` |
| `src:` routes in Vite builds | static `import` + `component:` |

---

## Quality Gate

Before finalizing TinyBubble-related edits:
- [ ] No `this.props.*.value` remains
- [ ] No mustache inside HTML attributes (`attr="{{...}}"`)
- [ ] Static `class`/`style` base preserved when using `:class`/`:style`
- [ ] No mixed topic APIs (`bubble.topic` vs `bubble.events.topic`)
- [ ] Topic listeners use stable handler refs and detach in `beforeDestroy`
- [ ] `router-link` and `router-view` registered in `components` map where used
- [ ] `globals.t` initialized once via bubble-translate bootstrap when i18n required
- [ ] Emits names match child declaration and parent listeners exactly
- [ ] `bubble` imported from `tinybubble/events` (not from core bundle)
- [ ] Vite builds use static imports for routes (not `src:`)

---

## Problem → Reference Mapping

| Problem | Reference |
|---|---|
| New component/page scaffold | `references/components-core.md` |
| Child props not updating / wrong value shape | `references/props-emits.md` |
| Cross-component communication without prop drilling | `references/pubsub-lifecycle.md` |
| Duplicate pub-sub callbacks after re-init | `references/pubsub-lifecycle.md` |
| Progress tracking for async batches | `references/pubsub-lifecycle.md` (JobManager section) |
| Bubble i18n setup, language switch, or plugin edits | `references/plugins-bubble-translate.md` |
