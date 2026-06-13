# Components Core

## Quick Pattern

```js
export default {
    name: "MyComponent",
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
        return { title: "Counter", count: 0 };
    },
    increment() {
        this.data.count.value += 1;
    }
};
```

## Directives Reference

```html
<p>{{ count }}</p>
<img :src="imageUrl" :alt="label">
<button :disabled="isLoading">Go</button>
<div :class="{ active: isActive, hidden: !visible }"></div>
<div :class="['base', isActive ? 'active' : '']"></div>
<div :style="{ color: tone, fontSize: size + 'px' }"></div>
<div :style="'color:' + tone"></div>
<div class="card" :class="{ active: isActive }"></div>
<div style="padding:8px" :style="{ color: tone }"></div>
<button @click="submit">Submit</button>
<input @input="onInput($event)">
<input type="file" @change="onFileChange($event)">
<p x-if="isLoggedIn">Welcome</p>
<p x-show="isLoggedIn">Welcome</p>
<input x-model="formField">
<li x-for="item in items">{{ item.name }}</li>
<li x-for="(item, index) in items">{{ index }}: {{ item.name }}</li>
<li x-for="(value, key) in record">{{ key }}: {{ value.label }}</li>
```

## Attribute Binding

```html
<img :src="imageUrl">
<button :disabled="isLoading"></button>
```

Use `:attr="expr"` for reactive attributes. Mustache interpolation is for text nodes.

## Do / Don't

| Do | Don't |
|---|---|
| `:src="imageUrl"` | `src="{{ imageUrl }}"` |
| `return /*html*/"<section></section>"` | `return ""` |
| `{{ title }}` where `title` is data, prop, method, global, or loop local | `{{ title }}` where `title` is only a local variable inside `template()` |
| `x-model="form.email"` | `x-model="getEmail()"` |
| `x-if="ready"` when a child must wait before mounting | `x-show="ready"` when a child must not initialize yet |

## Lifecycle Hooks

```js
export default {
    init() {
        // setup, fetch kickoff
    },
    mounted() {
        // DOM operations after appendTo
    },
    beforeDestroy() {
        // cleanup listeners/timers
    },
    destroy() {
        // optional post-destroy logic
    }
};
```

## Rules

- `template()` returns one root element
- Empty templates throw `TinyBubble template must return one root element`
- State writes use `this.data.key.value = next`
- Avoid `x-if` on a component root that should persist; prefer parent wrapper or `x-show`
- Keep template expressions light; move logic to methods when complex
- For `@input`/`@change`, bare handlers receive `(newValue, oldValue)`; use `$event` explicitly when you need full event data (for example `target.files`).
- Local variables declared inside `template()` are not available to later `{{ }}` evaluation; use `data`, `props`, methods, globals, or `x-for` locals.
- `x-model` must point to a writable signal name or object path, not a function call result.
- `x-show` and `x-hide` keep child components mounted; use `x-if` when a child must not initialize before data is ready.
