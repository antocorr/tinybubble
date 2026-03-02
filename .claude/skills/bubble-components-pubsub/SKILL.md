---
name: bubble-components-pubsub
description: Comprehensive Bubble skill for component/page authoring, props-emits wiring, router usage, and pub-sub topic lifecycle patterns. Always apply for files ending in .bub.js or .bubble.js. Use for frontend Bubble tasks; skip for backend-only changes.
license: MIT
metadata:
  author: card-room
  tags: bubble, components, props, emits, pubsub, router, sfc
---

# Bubble Components + PubSub

## When To Apply

Apply when the request involves:
- New Bubble component/page creation
- Child component registration with props/emits
- Fixing `this.props.foo.value` usage
- Adding or refactoring event listeners (game/session pub-sub)
- Bubble router setup or route updates

**Auto-trigger:** always activate for files ending `.bub.js` or `.bubble.js`.

Skip when task is server-only (no Bubble UI).

---

## 1. Component Shape

```js
export default {
    name: "MyComponent",
    template() {
        /* html */
        return `
        <section>
            <h2>{{ title }}</h2>
            <button type="button" @click="increment">+1</button>
            <p>{{ count }}</p>
        </section>
        `;
    },
    data() {
        return { title: "Counter", count: 0 };
    },
    increment() {
        this.data.count.value += 1;
    }
};
```

Rules:
- `template()` returns **one root element**
- State updates: `this.data.key.value = newValue`
- Methods are auto-bound to `this`
- `/* html */` comment above template literals for editor highlighting

---

## 2. Reactive Bindings

| Syntax | Use for |
|---|---|
| `{{ expr }}` | Text content only |
| `:attr="expr"` | Reactive attribute binding |
| `:class="{ active: cond }"` | Object class binding |
| `:class="['a', cond ? 'b' : '']"` | Array class binding |
| `:disabled="isLoading"` | Boolean attributes (sets/removes attr correctly) |
| `@click="method"` | Event handlers |
| `@click="method($event)"` | With event object |

**Critical:** `attr="{{signal}}"` does **NOT** work for attributes. Always use `:attr="expr"`.

Text interpolation still works: `<p>{{ count }}</p>`, `<span>Hello {{ name }}</span>`.

---

## 3. Props and Emits

Child component:

```js
export default {
    name: "ChildCard",
    props: ["userId", "label"],
    emits: ["save"],
    template() {
        /* html */
        return `
        <article>
            <h3>{{ label }}</h3>
            <p>User: {{ userId }}</p>
            <button type="button" @click="onSave">Save</button>
        </article>
        `;
    },
    onSave() {
        this.emit("save", { id: this.props.userId });
    }
};
```

Parent wiring:

```html
<child-card :user-id="activeUserId" :label="'User: ' + name" @save="handleSave"></child-card>
```

**Props rules:**
- `this.props.foo` is always a **raw value** (proxy auto-unwraps the signal)
- Never use `this.props.foo.value`
- In templates: `{{ foo }}` — not `{{ props.foo }}`
- Bare signal refs (`:count="counter"`) pass the signal directly → always reactive
- Complex expressions (`:title="'Prefix: ' + counter"`) → reactive via `computed()` internally
- Static strings (`label="Profile"`) → static, pass without `:`

**To react to prop changes in JS**, use `watchProp`:

```js
import { watchProp } from "../src/lib/Reactivity.js";

mounted() {
    watchProp(this, "userId", (newVal) => {
        // called whenever userId prop changes
    });
}
```

**Emits checklist:**
- Child `emits: ["eventName"]` declared
- Child calls `this.emit("eventName", payload)`
- Parent listens with `@eventName="handler"` (case-sensitive match)
- Prefer object payloads for multi-field events

---

## 4. x-if and x-show

- Use `x-if` in the **parent** around a component tag — fully supported:
  ```html
  <div x-if="isVisible">
      <my-component :count="counter"></my-component>
  </div>
  ```
- Do **not** put `x-if` on the root element inside a component's `template()` — use `x-show` there instead
- When an x-if re-shows a component, it remounts with the latest signal values

---

## 5. PubSub Lifecycle

```js
import { bubble } from "../../lib/bubble/src/index-events.js"; // adjust path

export default {
    init() {
        const gameTopic = bubble.events.topic("game");

        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
        }

        this._joinedHandler = (data) => this.handleJoined(data);
        gameTopic.on("joined", this._joinedHandler);
    },
    handleJoined(data) { /* ... */ }
};
```

Rules:
- API: `bubble.events.topic("name")` — never `bubble.topic("name")`
- Store handler refs on `this` for detach
- Detach before re-registering inside `init()` or any re-init path
- Emit structured payloads: `topic.emit("event", { ... })`
- Anonymous inline handlers cannot be detached — avoid them

---

## 6. Router

```js
import { createRouter } from "../src/index.js";

export const router = createRouter({
    mode: "hash",
    base: window.location.pathname,
    routes: [
        { path: "/", component: Home },
        { path: "/profile/:id", component: Profile },
        { path: "/async", src: "./pages/AsyncPage.js" },
        { path: "/persistent", component: Home, persistent: true }
    ]
});
```

App shell registration:

```js
components: {
    "router-link": router.RouterLink,
    "router-view": router.RouterView
}
```

```html
<router-link to="/profile">Profile</router-link>
<router-view></router-view>
```

Rules:
- Register `router-link` and `router-view` in the parent's `components` map
- Pass route props via `data: { props: { key: value } }` on the route definition
- Declared `props` in the component must match keys in `data.props`
- Use `persistent: true` only when intentional state retention is needed

---

## 7. Globals (global template helpers)

Register functions once, available in every component's template scope without per-component imports:

```js
import { globals } from "./src/lib/Reactivity.js";

globals.btr = btranslate;
globals.fmt = formatDate;
```

```html
<!-- in any component template -->
<p>{{ btr('hello') }}</p>
<span>{{ fmt(createdAt) }}</span>
<button :title="btr('save')">Save</button>
```

Rules:
- Register before any component mounts
- Component methods, data, and props take precedence over mixin keys — no accidental overrides
- Keep mixin functions pure and side-effect free

---

## 8. Signals API (for advanced use)

```js
import { signal, effect, computed, tick, collectEffects, watchProp } from "./src/lib/Signals.js";

// Effects batch automatically via queueMicrotask
const count = signal(0);
const doubled = computed(() => count.value * 2);

// Force synchronous flush (useful in tests)
tick();

// Collect and dispose multiple effects at once
const disposers = collectEffects(() => {
    effect(() => { /* ... */ });
    effect(() => { /* ... */ });
});
disposers.forEach(d => d()); // cleanup
```

---

## Migration Checklist

Replace old patterns:

| Old | New |
|---|---|
| `this.props.foo.value` | `this.props.foo` |
| `{{ props.foo }}` in template | `{{ foo }}` |
| `bubble.topic("x")` | `bubble.events.topic("x")` |
| `attr="{{signal}}"` | `:attr="signal"` |

Verify with:
```bash
rg "this\.props\.[a-zA-Z0-9_]+\.value" src/
rg "\{\{\s*props\." src/
rg "\bbubble\.topic\(" src/
rg '(src|href|disabled|class|alt|title)="\{\{' src/
```

---

## Quality Gate

Before finalizing Bubble-related edits:
- [ ] No `this.props.*.value` remains
- [ ] No `attr="{{signal}}"` in HTML attributes — use `:attr="expr"` instead
- [ ] No mixed topic APIs (`bubble.topic` vs `bubble.events.topic`) in touched files
- [ ] Event listeners use stable handler refs and detach before re-attach
- [ ] Templates have one root element; `x-if` not on component root
- [ ] Emits case-sensitive match between child `emits` and parent `@event`

---

## Problem → Reference Mapping

| Problem | Start with |
|---|---|
| Child prop does not update / wrong value shape | `references/props-emits.md` |
| Event handlers fire multiple times after re-init | `references/pubsub-lifecycle.md` |
| New page/component scaffold needed | `references/components-core.md` |
| Template helper not available in interpolation | Section 7 (Globals) |

---

## References (deep dives)

- Component authoring: `references/components-core.md`
- Props and emits: `references/props-emits.md`
- PubSub lifecycle: `references/pubsub-lifecycle.md`
