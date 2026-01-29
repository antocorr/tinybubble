# Bubble component/page creation prompt

You are building Bubble Single File Components (SFC-style) that run in the browser without a build step. Use the patterns below to create new pages or reusable components.

## Core concepts
- Components are plain objects consumed by `createComponent` from `src/index.js`.
- `template()` returns a string of HTML; it can include Bubble directives and `{{ }}` interpolations.
- `data()` returns initial reactive state; Bubble wraps each key in a `SignalObject`, accessible as `this._data.key.value`.
- `props` declared on a component become unwrapped values on `component.props`.
- Methods are regular functions on the object; access them with `this` inside the component or call them from templates via directives.
- Lifecycle-like hooks: `init()` runs after binding; `mounted()` (if present) is invoked when appended manually in some examples.

## Template directives and syntax
- Text interpolation: `{{ expression }}` evaluates against `data`, `props`, and methods. Expressions can be computed (e.g., `{{ items.length }}`).
- Events: use `-x-on:event="expr"` or the sugar `@event="expr"`. If the value is the name of a method (no spaces/parentheses), it calls `this.method($event?)`.
- Binding attributes: `:attr="expr"` keeps the attribute in sync with a reactive value.
- Conditionals: `x-if="expr"` renders the node only when the expression is truthy (works on elements or `<template>`).
- Show/Hide: `x-show="expr"` toggles `display`; `x-hide` is the inverse.
- Lists: `x-for="item in items"` on an element or `<template>` clones for each item. Destructure index with `(item, idx) in items`.
- Two-way input: `x-model="signalKey"` binds inputs to a `SignalObject` in scope.
- Refs: `ref="name"` stores the element on `component.refs.name`.

## Custom components, props, and emits
- Register child components via a `components` map: `{ 'my-child': ChildComponent }`.
- Pass data down with static attributes or `:prop="expression"`. If the expression is a `SignalObject`, it is forwarded as a value.
- Declare `emits: ['eventName']` on the child; parents listen with `-x-on:eventName="handler"`. Inside the child, call `this.emit('eventName', payload)`.
- Slots/children are available as `props.children` on functional components (those exported as a function instead of an object).

## Signals and helpers
- Import from `src/index.js`: `createComponent`, `createSignal`, `Signal`, `effect`, `watch`, `createRouter`, `html`.
- `Signal(value)` or `createSignal` create reactive values outside of SFC `data`.
- `effect(fn)` re-runs `fn` when subscribed signals change; `watch(source, cb)` calls `cb(newVal, oldVal)` when `source` updates.

## Router usage
- `createRouter({ mode: 'hash' | 'history', base, routes })` returns `{ RouterView, RouterLink, navigate, getDestination, setDestination }`.
- Each route: `{ path, component, data?, persistent? }`. `persistent: true` keeps the component instance alive across navigations.
- Use `<router-link to="/path">` or the functional `RouterLink` component; `<router-view/>` renders the matched route.
- Provide router components in a parent via `components: { 'router-link': router.RouterLink, 'router-view': router.RouterView }`.

## Example: new page component
```js
// pages/Profile.js
export default {
  name: 'ProfilePage',
  props: ['userId'],
  emits: ['saved'],
  template() {
    return `
      <section class="p-6">
        <h1 class="text-2xl font-bold">Profile {{ props.userId }}</h1>
        <label class="block mt-4">
          Name:
          <input class="border px-2" x-model="name" />
        </label>
        <button class="mt-3 px-4 py-2 bg-blue-600 text-white" @click="saveProfile">
          Save
        </button>
        <p class="mt-2 text-sm text-gray-600" x-if="savedMsg">{{ savedMsg }}</p>
      </section>
    `;
  },
  data() {
    return {
      name: 'Alice',
      savedMsg: ''
    };
  },
  saveProfile() {
    this._data.savedMsg.value = 'Saved!';
    this.emit('saved', { id: this.props.userId, name: this._data.name.value });
  }
};
```

## Example: wiring a router-driven app
```js
// components/router.js
import { createRouter } from '../src/index.js';
import Home from './pages/Home.js';
import Profile from './pages/Profile.js';

export const router = createRouter({
  mode: 'hash',
  base: window.location.pathname,
  routes: [
    { path: '/', component: Home },
    { path: '/profile', component: Profile, data: { props: { userId: '42' } } },
  ]
});
```
```js
// components/app.js
import { createComponent } from '../src/index.js';
import { router } from './router.js';

const App = {
  name: 'AppShell',
  template() {
    return `
      <div>
        <nav class="flex gap-4 p-4 bg-gray-100">
          <router-link to="/">Home</router-link>
          <router-link to="/profile">Profile</router-link>
        </nav>
        <main class="p-4">
          <router-view/>
        </main>
      </div>
    `;
  },
  components: {
    'router-link': router.RouterLink,
    'router-view': router.RouterView
  }
};

const app = createComponent(App);
app.appendTo(document.getElementById('app'));
```

## Authoring checklist
- Always return a single root element from `template()`.
- Mutate state via `this._data.key.value = ...` (or `.push()` on arrays) so effects run.
- Keep `props` and `data` values serializable; styling can be inline or via `style` string on the component.
- Prefer `@event="methodName"` for clarity; use expressions only when needed.
- For lists, wrap markup in `<template x-for="item in items">` when you need multiple root nodes.
