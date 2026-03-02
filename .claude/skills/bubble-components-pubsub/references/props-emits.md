# Props and Emits

## Full Example

Child component:

```js
export default {
    name: "ChildCard",
    props: ["userId", "label"],
    emits: ["save", "delete"],
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
<!-- Bare signal ref → reactive, passes signal directly -->
<child-card :user-id="activeUserId" @save="handleSave"></child-card>

<!-- Complex expression → reactive via computed() internally -->
<child-card :label="'User: ' + activeUser.name" @save="handleSave"></child-card>

<!-- Static string → no need for : prefix -->
<child-card label="Profile" @save="handleSave"></child-card>
```

## Props Behavior

`this.props.foo` is **always a raw value** — the proxy auto-unwraps the signal.

| Passed as | Internally | `this.props.foo` returns |
|---|---|---|
| `:foo="signalName"` (bare identifier) | SignalObject | `signal.value` |
| `:foo="'prefix ' + sig"` (expression) | computed SignalObject | computed `.value` |
| `foo="static"` (static) | Signal("static") | `"static"` |

**Never** use `this.props.foo.value`. The proxy handles unwrapping.

In templates: `{{ foo }}` — not `{{ props.foo }}`.

## Reacting to Prop Changes in JS

```js
import { watchProp } from "../../src/lib/Reactivity.js"; // adjust path

export default {
    props: ["userId"],
    mounted() {
        watchProp(this, "userId", (newVal) => {
            this.loadUser(newVal);
        });
    },
    loadUser(id) { /* ... */ }
};
```

## Emits Contract

1. Child declares: `emits: ["eventName"]`
2. Child calls: `this.emit("eventName", payload)`
3. Parent listens: `@eventName="handler"` (exact case match)
4. Prefer object payloads: `this.emit("save", { id, data })` over primitives

## Common Pitfalls

- `this.props.foo.value` — wrong, proxy already unwraps
- `{{ props.foo }}` in template — wrong, use `{{ foo }}`
- `user-id="{{activeUserId}}"` — wrong, mustache never works in attributes
- Emitting with a name that doesn't match parent `@event` attribute (case matters)
- Not declaring the event in child `emits` array
