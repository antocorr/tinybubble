# PubSub Lifecycle

Use pub-sub for cross-component communication when data/events must travel between components that are not in a direct parent-child chain.
This avoids passing callbacks and props through multiple intermediate layers.

## Quick Pattern

```js
import { bubble } from "bubblejs/dist/bubble-events.js";

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
- Do not use `bubble.topic("name")`
- Store handler references on `this`
- Detach old handlers before re-registering in repeated init paths
- Prefer structured payloads: `topic.emit("event", { ... })`
- Avoid anonymous inline handlers for topic subscriptions

## Common Pitfalls

- Mixed API usage in same file (`bubble.topic` and `bubble.events.topic`)
- Re-init without detach, causing duplicated callbacks
- Topic `.on(...)` calls with anonymous callbacks that cannot be detached
