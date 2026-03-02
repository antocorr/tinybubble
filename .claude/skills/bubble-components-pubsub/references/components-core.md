# Components Core

## Quick Pattern

```js
export default {
    name: "MyComponent",
    template() {
        /*html*/
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

## Directives Reference

```html
<!-- Text interpolation (text nodes only) -->
<p>{{ count }}</p>

<!-- Reactive attribute -->
<img :src="imageUrl" :alt="label">

<!-- Boolean attribute — sets/removes correctly -->
<button :disabled="isLoading">Go</button>

<!-- Class object syntax -->
<div :class="{ active: isActive, hidden: !visible }">

<!-- Class array syntax -->
<div :class="['base', isActive ? 'active' : '']">

<!-- Event handlers -->
<button @click="submit">Submit</button>
<input @input="onInput($event)">

<!-- Conditional rendering -->
<p x-if="isLoggedIn">Welcome</p>
<p x-show="isLoggedIn">Welcome</p>  <!-- hides but keeps in DOM -->

<!-- List rendering -->
<ul>
    <template x-for="item in items">
        <li>{{ item.name }}</li>
    </template>
</ul>

<!-- v-model equivalent -->
<input x-model="formField">
```

## Wrong → Correct

```html
<!-- Wrong: mustache in attributes does not react -->
<img src="{{imageUrl}}">
<button disabled="{{isLoading}}">

<!-- Correct -->
<img :src="imageUrl">
<button :disabled="isLoading">
```

## Lifecycle Hooks

```js
export default {
    init() { /* called after data/signals are set up, before DOM */ },
    mounted() { /* called after $element is inserted into the page */ },
    // no built-in destroy hook — use collectEffects for cleanup
};
```

## Rules

- `template()` returns **one root element**
- State writes: `this.data.key.value = newValue`
- `x-if` not on the root element of a component's template — use `x-show` there, or wrap the component tag with `x-if` in the parent
- Methods auto-bound to `this`; keep template expressions light
- 4-space indent, semicolons
