# Props And Emits

## Full Example

Child:

```js
export default {
    name: "ChildCard",
    props: ["userId", "label"],
    emits: ["save", "delete"],
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

Parent:

```html
<child-card :user-id="activeUserId" @save="handleSave"></child-card>
<child-card :label="'User: ' + activeUser.name" @save="handleSave"></child-card>
<child-card label="Profile" @save="handleSave"></child-card>
<child-card @reservation-update="handleReservationUpdate"></child-card>
```

## Props Behavior

- `this.props.foo` is already unwrapped
- In templates, read props directly by name, such as `{{ foo }}`
- Treat props as read-only

## Watching Prop Changes

```js
import { watchProp } from "tinybubble";

export default {
    props: ["userId"],
    init() {
        watchProp(this, "userId", (newVal) => {
            this.loadUser(newVal);
        });
    },
    loadUser(id) {
        // ...
    }
};
```

## Emits Contract

1. Child declares event in `emits`
2. Child calls `this.emit("eventName", payload)`
3. Parent listens with the same name for lowercase events: `@save="handler"`
4. For camelCase events, prefer kebab-case listeners: `emits: ["reservationUpdate"]` with `@reservation-update="handler"`
5. TinyBubble normalizes camelCase/kebab-case listener names for declared component emits

## Rules

- Read props as `this.props.foo` in JS methods
- Read props as `{{ foo }}` in templates
- Pass reactive props with `:user-id="activeUserId"`
- Declare every component event in `emits`
- Listen to camelCase emits with kebab-case HTML attributes

## Do / Don't

| Do | Don't |
|---|---|
| `this.props.userId` | `this.props.userId.value` |
| `{{ userId }}` | `{{ props.userId }}` |
| `:user-id="activeUserId"` | `user-id="{{ activeUserId }}"` |
| `emits: ["reservationUpdate"]` + `@reservation-update="handler"` | `@reservationUpdate="handler"` in HTML |
| `watchProp(this, "userId", cb)` inside `init()` | registering prop watchers in `mounted()` |
