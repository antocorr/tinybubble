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
<p x-if="isLoggedIn">Welcome</p>
<p x-show="isLoggedIn">Welcome</p>
<input x-model="formField">
<li x-for="item in items">{{ item.name }}</li>
```

## Wrong -> Correct

```html
<!-- Wrong -->
<img src="{{imageUrl}}">
<button disabled="{{isLoading}}"></button>

<!-- Correct -->
<img :src="imageUrl">
<button :disabled="isLoading"></button>
```

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
- State writes use `this.data.key.value = next`
- Avoid `x-if` on a component root that should persist; prefer parent wrapper or `x-show`
- Keep template expressions light; move logic to methods when complex
