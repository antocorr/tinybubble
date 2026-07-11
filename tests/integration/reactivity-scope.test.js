import { describe, expect, it } from "vitest";
import { createComponent, Signal } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("template scope tracks data added after first render", () => {
  it("picks up a Signal added to component.data inside init()", async () => {
    const App = {
      template() {
        return `<div>{{ trigger }}:{{ later ?? 'missing' }}</div>`;
      },
      data() {
        return { trigger: 0 };
      },
      init() {
        // Simulates a Signal added after the first bind (e.g. from async setup)
        this.data.later = Signal("available");
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    // Force the text-node effect to re-run so buildScope() is called again
    app.data.trigger.value = 1;
    await flushMicrotasks();

    expect(host.textContent).toContain("1:available");
  });
});
