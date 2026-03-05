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
```

## Props Behavior

- `this.props.foo` is already unwrapped
- Never read `this.props.foo.value`
- In template use `{{ foo }}` (not `{{ props.foo }}`)
- Treat props as read-only

## Watching Prop Changes

```js
import { watchProp } from "tinybubble";

export default {
    props: ["userId"],
    mounted() {
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
3. Parent listens with `@eventName="handler"`
4. Keep event naming case-consistent end-to-end

## Common Pitfalls

- `this.props.foo.value`
- `{{ props.foo }}`
- `user-id="{{activeUserId}}"` (mustache in attribute)
- Emitting undeclared events or mismatched case
