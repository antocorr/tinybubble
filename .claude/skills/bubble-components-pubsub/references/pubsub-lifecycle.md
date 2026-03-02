# PubSub Lifecycle

## Quick Pattern

```js
// Adjust import path to match your project structure
import { bubble } from "../../lib/events.js";

export default {
    init() {
        const gameTopic = bubble.events.topic("game");

        // Detach old listener before re-registering
        if (this._joinedHandler) {
            gameTopic.off("joined", this._joinedHandler);
        }

        this._joinedHandler = (data) => this.handleJoined(data);
        gameTopic.on("joined", this._joinedHandler);
    },
    handleJoined(data) { /* ... */ }
};
```

## Rule Set

- API: `bubble.events.topic("name")` — never `bubble.topic("name")`
- Store handler refs on `this` (named `this._xyzHandler`) so `.off()` can detach the exact function
- Detach before re-registering on every re-init path
- Emit structured payloads: `topic.emit("eventName", { ... })`
- Avoid anonymous inline handlers — they cannot be detached

## When to Detach

- Always detach/re-attach inside any repeated initialization path (`init()`, route transitions)
- If a teardown hook exists in the file, detach there too
- If no teardown hook: keep consistent with the local file's style

## Common Pitfalls

- `bubble.topic(...)` vs `bubble.events.topic(...)` mixed in same file
- Inline anonymous listeners that accumulate on each init call
- Re-init without cleanup → duplicate event handling (handlers fire multiple times)
