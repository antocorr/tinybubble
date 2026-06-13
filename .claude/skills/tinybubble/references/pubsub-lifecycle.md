# PubSub Lifecycle

Use pub-sub for cross-component communication when data/events must travel between components that are not in a direct parent-child chain.
This avoids passing callbacks and props through multiple intermediate layers.

## Quick Pattern

```js
import { bubble } from "tinybubble/events";

export default {
    init() {
        const gameTopic = bubble.events.topic("game");

        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
        }

        this._joinedHandler = (data) => this.handleJoined(data);
        gameTopic.on("joined", this._joinedHandler);
    },
    beforeDestroy() {
        const gameTopic = bubble.events.topic("game");
        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
            this._joinedHandler = null;
        }
    },
    handleJoined(data) {
        // ...
    }
};
```

## Rule Set

- Use `bubble.events.topic("name")`
- Store handler references on `this`
- Detach old handlers before re-registering in repeated init paths
- Prefer structured payloads: `topic.emit("event", { ... })`
- Avoid anonymous inline handlers for topic subscriptions

## Do / Don't

| Do | Don't |
|---|---|
| `bubble.events.topic("cart")` | `bubble.topic("cart")` |
| Store handler refs on `this` | Anonymous callbacks in `.on(...)` |
| Detach in `beforeDestroy()` | Leave topic listeners registered after destroy |
| `topic.emit("event", { id, value })` | positional payloads that are hard to evolve |
