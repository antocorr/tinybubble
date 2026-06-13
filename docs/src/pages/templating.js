import { injectCodeBlocks } from '../components/CodeBlock.js'

const blocks = {
  interpolation: {
    code: `<p>Hello, {{ name }}!</p>
<p>Price: \${{ (price * qty).toFixed(2) }}</p>
<p>Status: {{ isActive ? 'Active' : 'Inactive' }}</p>`,
    lang: 'html',
  },
  attrBasic: {
    code: `<a :href="url" :title="linkTitle">Link</a>
<img :src="avatarUrl" :alt="user.name" />
<input :placeholder="hintText" />`,
    lang: 'html',
  },
  attrClass: {
    code: `<!-- Object: key = class name, value = condition -->
<div :class="{ active: isActive, 'text-red-500': hasError }"></div>

<!-- Array -->
<div :class="['base', isActive && 'active', isPrimary ? 'primary' : '']"></div>

<!-- Mix static + dynamic (static base is preserved) -->
<div class="btn" :class="{ 'btn-primary': isPrimary }"></div>`,
    lang: 'html',
  },
  attrStyle: {
    code: `<!-- Object (camelCase keys) -->
<div :style="{ color: textColor, fontSize: size + 'px' }"></div>

<!-- String -->
<div :style="'color:' + textColor"></div>

<!-- Mix static + dynamic -->
<div style="font-weight:bold" :style="{ color: textColor }"></div>`,
    lang: 'html',
  },
  attrBoolean: {
    code: `<!-- Removed when falsy, added (empty) when truthy -->
<button :disabled="isLoading">Submit</button>
<input :checked="agreed" type="checkbox" />
<details :open="showDetails">...</details>`,
    lang: 'html',
  },
  events: {
    code: `<!-- Call a method (shorthand for method reference) -->
<button @click="increment">+1</button>

<!-- Prefer methods for state writes -->
<button @click="nextStep">Next</button>

<!-- Pass arguments -->
<button @click="remove(item)">Delete</button>

<!-- Prevent default with -prevent modifier -->
<form @submit-prevent="save">...</form>

<!-- Access native event with $event -->
<input @input="onInput($event)" />`,
    lang: 'html',
  },
  xmodel: {
    code: `<!-- Simple binding -->
<input x-model="username" type="text" />
<p>Hello, {{ username }}!</p>

<!-- Nested property -->
<input x-model="form.email" type="email" />
<input x-model="form.password" type="password" />

data() {
  return {
    username: '',
    form: { email: '', password: '' }
  }
}

// x-model target must be writable:
// use x-model="form.email", not x-model="getEmail()"`,
    lang: 'javascript',
  },
  xif: {
    code: `<p x-if="isLoggedIn">Welcome back!</p>

<!-- Use <template> for multiple siblings (no wrapper node) -->
<template x-if="showPanel">
  <h2>Settings</h2>
  <p>Configure your account below.</p>
</template>`,
    lang: 'html',
  },
  xshow: {
    code: `<!-- Toggles display:none — element stays in DOM -->
<div x-show="menuOpen" class="dropdown">...</div>

<!-- x-hide is the inverse -->
<span x-hide="isLoading">Ready</span>

<!-- Child components inside x-show still mount and run lifecycle hooks -->`,
    lang: 'html',
  },
  xfor: {
    code: `<ul>
  <li x-for="item in todos">{{ item.text }}</li>
</ul>

<!-- With index: (item, index) — note parentheses -->
<li x-for="(todo, i) in todos">{{ i + 1 }}. {{ todo.text }}</li>

<!-- Objects: (value, key) -->
<li x-for="(category, key) in categories">
  {{ key }}: {{ category.label }}
</li>

<!-- Multiple siblings per iteration -->
<template x-for="p in products">
  <dt>{{ p.name }}</dt>
  <dd>\${{ p.price }}</dd>
</template>`,
    lang: 'html',
  },
  xforReactive: {
    code: `// Assign a new array to trigger re-render
addTodo() {
  this.data.todos.value = [...this.data.todos.value, { text: 'New item' }]
}

removeTodo(index) {
  const next = [...this.data.todos.value]
  next.splice(index, 1)
  this.data.todos.value = next
}`,
    lang: 'javascript',
  },
  refs: {
    code: `<!-- Template -->
<canvas ref="chart" width="400" height="200"></canvas>
<input ref="searchInput" type="search" />

<!-- Component method — refs populated after init() -->
mounted() {
  const ctx = this.refs.chart.getContext('2d')
  this.refs.searchInput.focus()
}`,
    lang: 'javascript',
  },
  templateScope: {
    code: `template() {
  const title = this.data.title.value
  return \`<h1>{{ title }}</h1>\`  // wrong: local variable is gone later
}

// Use data directly or a method:
template() {
  return \`<h1>{{ pageTitle() }}</h1>\`
}

pageTitle() {
  return this.data.title.value
}`,
    lang: 'javascript',
  },
}

export default {
  name: 'TemplatingPage',

  template() {
    return /*html*/`
      <article class="prose dark:prose-invert max-w-none">
        <h1>Templating</h1>
        <p class="lead">
          TinyBubble uses a Vue-inspired template syntax. Templates are plain HTML strings —
          the engine walks the DOM tree and attaches reactive effects for every binding it finds.
          Each template must return one root element.
        </p>

        <blockquote>
          Template bindings run after <code>template()</code> returns. They can read component <code>data</code>, <code>props</code>, methods, globals, and <code>x-for</code> locals, but not local variables declared inside <code>template()</code>.
        </blockquote>
        <div data-code="templateScope"></div>

        <h2>Text interpolation — <code>{<wbr>{ }<wbr>}</code></h2>
        <p>Double curly braces evaluate a JS expression as text. Updates automatically when signals change.</p>
        <div data-code="interpolation"></div>

        <h2>Dynamic attributes — <code>:attr</code></h2>
        <p>Prefix any attribute with <code>:</code> to make it reactive.</p>
        <div data-code="attrBasic"></div>

        <h3>Dynamic class</h3>
        <p><code>:class</code> accepts a string, array, or object. Static <code>class</code> is preserved as base.</p>
        <div data-code="attrClass"></div>

        <h3>Dynamic style</h3>
        <div data-code="attrStyle"></div>

        <h3>Boolean attributes</h3>
        <p>Attributes like <code>disabled</code>, <code>checked</code>, <code>hidden</code> are toggled based on truthiness.</p>
        <div data-code="attrBoolean"></div>

        <h2>Event handling — <code>@event</code></h2>
        <p>
          <code>@click</code> is shorthand for a DOM event listener. Expressions are evaluated in component scope.<br/>
          For <code>@input</code> and <code>@change</code>, bare handlers receive <code>(newValue, oldValue)</code>.
          Use <code>$event</code> to get the native DOM event.
        </p>
        <div data-code="events"></div>

        <h2>Two-way binding — <code>x-model</code></h2>
        <p>Binds an input's value to a writable signal name or object path, syncing both ways.</p>
        <div data-code="xmodel"></div>

        <h2>Conditional rendering — <code>x-if</code></h2>
        <p>Adds/removes the element from the DOM. Use <code>&lt;template&gt;</code> for multiple siblings.</p>
        <div data-code="xif"></div>

        <h2>Show / Hide — <code>x-show</code> / <code>x-hide</code></h2>
        <p>Toggles <code>display:none</code> without removing from DOM. Prefer over <code>x-if</code> for cheap toggles. Use <code>x-if</code> when a child component must not mount until data is ready.</p>
        <div data-code="xshow"></div>

        <h2>List rendering — <code>x-for</code></h2>
        <p>Loops over arrays and plain objects. With objects, <code>(value, key)</code> exposes the property value and key.</p>
        <div data-code="xfor"></div>

        <h3>Reactive list updates</h3>
        <p>Assign a new array to the signal — TinyBubble re-renders the list.</p>
        <div data-code="xforReactive"></div>

        <h2>Template refs — <code>ref</code></h2>
        <p>Get a direct reference to a DOM element via <code>this.refs.name</code>.</p>
        <div data-code="refs"></div>

        <nav class="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <a href="#/guide/signals"
             class="flex flex-col items-start px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
            <span class="font-medium text-sm">Signals &amp; Reactivity</span>
          </a>
          <a href="#/guide/components"
             class="flex flex-col items-end px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
            <span class="font-medium text-sm">Component System</span>
          </a>
        </nav>
      </article>
    `
  },

  init() {
    injectCodeBlocks(this.$element, blocks)
  },
}
