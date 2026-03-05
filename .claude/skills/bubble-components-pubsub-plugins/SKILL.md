---
name: bubble-components-pubsub-plugins
description: Comprehensive Bubble skill for component/page authoring, props-emits wiring, router usage, pub-sub topic lifecycle, and plugin integration (especially bubble-translate). Always apply for files ending in .bub.js or .bubble.js, and for Bubble UI tasks that wire globals.t, i18nLang, or language switching.
license: MIT
metadata:
  author: card-room
  tags: bubble, components, props, emits, pubsub, router, plugins, i18n, bubble-translate
---

# Bubble Components + PubSub + Plugins

## When To Apply

Apply when the request involves:
- New Bubble component/page creation or refactor (`.bub.js`, `.bubble.js`)
- Child component registration with props/emits
- Fixing `this.props.foo.value` and template binding mistakes
- Event topic wiring, listener cleanup, or pub-sub refactor
- Bubble router setup or route updates
- Bubble translation wiring (`globals.t`, `i18nLang`, language switch)
- Work inside `plugins/bubble-translate/`

**Auto-trigger:** always activate for files ending `.bub.js` or `.bubble.js`.

Skip for server-only work with no Bubble UI.

---

## Source Of Truth For This Repo

When in doubt, align to these runtime files:
- `src/lib/Reactivity.js`
- `src/lib/Router.js`
- `src/lib/Bubble.js`
- `src/lib/EventTopic.js`
- `plugins/bubble-translate/bubble.js`
- `plugins/bubble-translate/index.js`

Use references in this skill for quick recipes, then verify API names against those files.

---

## 1. Component Shape

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

Rules:
- `template()` returns one root element
- State writes use `this.data.key.value = next`
- Methods are auto-bound to `this`
- Prefer `/*html*/` directly before template literal for editor highlighting

---

## 2. Reactive Bindings

| Syntax | Use for |
|---|---|
| `{{ expr }}` | Text interpolation |
| `:attr="expr"` | Reactive attributes |
| `:class="{ active: cond }"` | Class object binding |
| `:class="['a', cond ? 'b' : '']"` | Class array binding |
| `:style="{ color: tone, fontSize: size + 'px' }"` | Object style binding |
| `:style="'color:' + tone"` | String style binding |
| `:disabled="isLoading"` | Boolean attrs |
| `@click="method"` | Event handler |
| `@submit-prevent="onSubmit"` | Event + prevent default |
| `x-if="expr"` | Conditional mount/unmount |
| `x-show="expr"` | Toggle display |
| `x-model="field"` | Two-way binding |
| `x-for="item in items"` | Loop |
| `ref="name"` | DOM ref |

Critical:
- `attr="{{signal}}"` does not create reactive attributes, always use `:attr="expr"`
- In templates use `{{ foo }}`, not `{{ props.foo }}`
- `class` and `style` are accumulable: static values are preserved as base and `:class`/`:style` appends dynamic values on re-renders

---

## 3. Props And Emits

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
        this.emit("save", { id: this.props.userId });
    }
};
```

Parent wiring:

```html
<child-card :user-id="activeUserId" :label="'User: ' + name" @save="handleSave"></child-card>
```

Rules:
- `this.props.foo` is already unwrapped (raw value)
- Never use `this.props.foo.value`
- Declare `emits` for every event emitted by child
- Parent listener name must match exactly (case-sensitive)
- Prefer object payloads for multi-field events

To react to prop changes in JS:

```js
import { watchProp } from "bubblejs";

mounted() {
    watchProp(this, "userId", (newVal, oldVal) => {
        this.loadUser(newVal);
    });
}
```

---

## 4. Lifecycle And Cleanup

Use the hooks based on intent:
- `init()` for startup logic and fetch kickoff
- `mounted()` for DOM actions that should happen after append (focus, measurements)
- `beforeDestroy()` for cleanup before teardown
- `destroy()` for post-teardown custom logic

Notes for this runtime:
- `init()` runs during component creation
- `mounted()` runs when `appendTo()` inserts element

---

## 5. PubSub Lifecycle

Use topics when components need cross-component communication (siblings, distant branches, pages/widgets) without prop drilling through the whole parent chain.
Pub-sub keeps those interactions decoupled from component hierarchy.

```js
import { bubble } from "bubblejs/dist/bubble-events.js";

export default {
    init() {
        const gameTopic = bubble.events.topic("game");

        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
        }

        this._joinedHandler = (payload) => this.handleJoined(payload);
        gameTopic.on("joined", this._joinedHandler);
    },
    beforeDestroy() {
        const gameTopic = bubble.events.topic("game");
        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
            this._joinedHandler = null;
        }
    },
    handleJoined(payload) {
        // ...
    }
};
```

Rules:
- API is `bubble.events.topic("name")`, never `bubble.topic("name")`
- Store handler refs on `this` so `.off()` can detach exact function
- Detach before re-register in repeated init paths
- Avoid anonymous inline listeners for topic events

---

## 6. Router

```js
import { createRouter } from "bubblejs";

export const router = createRouter({
    mode: "hash",
    routes: [
        { path: "/", component: Home },
        { path: "/profile/:id", component: Profile },
        { path: "/async", src: "./pages/AsyncPage.js" },
        { path: "/persistent", component: Home, persistent: true },
        { path: "*", component: NotFound }
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
<router-link to="/profile/42">Profile</router-link>
<router-view></router-view>
```

Rules:
- Register `router-link` and `router-view` in component map
- Programmatic navigation uses `router.navigate("/path")`
- Use `persistent: true` only with clear state-retention intent

---

## 7. Globals And bubble-translate Plugin

Use `plugins/bubble-translate/bubble.js` for Bubble apps.

### Bootstrap once

```js
import { createComponent } from "bubblejs";
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
- Template calls like `{{ t('Home') }}` update reactively after language change

### In components

```js
import { globals } from "bubblejs";

export default {
    data() {
        return { currentLang: "en_EN" };
    },
    async switchLanguage(lang) {
        await globals.t.setLang(lang);
        this.data.currentLang.value = globals.t.lang;
    },
    template() {
        return /*html*/`
        <section>
            <h2>{{ t('Welcome') }}</h2>
            <button @click="(e) => switchLanguage('it_IT')">{{ t('Italian') }}</button>
        </section>
        `;
    }
};
```

Guidelines:
- Initialize translate once at app bootstrap, not per component instance
- In JS methods, use `globals.t` (template `t(...)` is available via template scope)
- Use message keys consistently (`t("...key...")`) to ease localization files
- `%s` placeholders are positional (`t("Hi %s", userName)`)
- Fallback is key-as-text when translation is missing

If task targets non-Bubble usage (plain JS/Vue plugin files), see `references/plugins-bubble-translate.md`.

---

## Migration Checklist

Replace old patterns:

| Old | New |
|---|---|
| `this.props.foo.value` | `this.props.foo` |
| `{{ props.foo }}` | `{{ foo }}` |
| `bubble.topic("x")` | `bubble.events.topic("x")` |
| `src="{{imageUrl}}"` | `:src="imageUrl"` |

---

## Quality Gate

Before finalizing Bubble-related edits:
- [ ] No `this.props.*.value` remains
- [ ] No mustache inside HTML attributes (`attr="{{...}}"`)
- [ ] Static `class`/`style` base is preserved when using `:class`/`:style`
- [ ] No mixed topic APIs (`bubble.topic` and `bubble.events.topic`) in touched files
- [ ] Topic listeners use stable handler refs and detach on re-init/cleanup
- [ ] `router-link` and `router-view` registered where used
- [ ] `globals.t` is initialized once via bubble-translate bootstrap when i18n is required
- [ ] Emits names match child declaration and parent listeners

---

## Problem -> Reference Mapping

| Problem | Start with |
|---|---|
| New component/page scaffold | `references/components-core.md` |
| Child props not updating / wrong value shape | `references/props-emits.md` |
| Cross-component communication without prop drilling | `references/pubsub-lifecycle.md` |
| Duplicate pub-sub callbacks after re-init | `references/pubsub-lifecycle.md` |
| Bubble i18n setup, language switch, or plugin edits | `references/plugins-bubble-translate.md` |

---

## References

- Core component authoring: `references/components-core.md`
- Props and emits: `references/props-emits.md`
- Topic lifecycle: `references/pubsub-lifecycle.md`
- bubble-translate integration: `references/plugins-bubble-translate.md`
- Optional repo audit script: `scripts/audit-bubble-patterns-plugins.sh`
