import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("reactivity directives", () => {
  it("syncs x-model both ways", async () => {
    const App = {
      template() {
        return `
          <div>
            <input id="name-input" type="text" x-model="name" />
            <p id="name-output">{{ name }}</p>
          </div>
        `;
      },
      data() {
        return { name: "Mario" };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    const input = host.querySelector("#name-input");
    const output = host.querySelector("#name-output");

    expect(input.value).toBe("Mario");
    expect(output.textContent).toContain("Mario");

    input.value = "Luigi";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flushMicrotasks();

    expect(output.textContent).toContain("Luigi");

    app.data.name.value = "Peach";
    await flushMicrotasks();

    expect(input.value).toBe("Peach");
    expect(output.textContent).toContain("Peach");
  });

  it("handles x-if, x-show, boolean attrs and class bindings", async () => {
    const App = {
      template() {
        return `
          <div>
            <button id="toggle" @click="toggle">Toggle</button>
            <div id="conditional" x-if="visible">Conditional content</div>
            <div id="shown" x-show="visible">Visible block</div>
            <button id="guarded" :disabled="!visible">Action</button>
            <div id="state-class" :class="{ active: visible, muted: !visible }">State</div>
          </div>
        `;
      },
      data() {
        return { visible: true };
      },
      toggle() {
        this.data.visible.value = !this.data.visible.value;
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("#conditional")).not.toBeNull();
    expect(host.querySelector("#shown").style.display).toBe("");
    expect(host.querySelector("#guarded").hasAttribute("disabled")).toBe(false);
    expect(host.querySelector("#state-class").className).toContain("active");

    host.querySelector("#toggle").click();
    await flushMicrotasks();

    expect(host.querySelector("#conditional")).toBeNull();
    expect(host.querySelector("#shown").style.display).toBe("none");
    expect(host.querySelector("#guarded").hasAttribute("disabled")).toBe(true);
    expect(host.querySelector("#state-class").className).toContain("muted");

    app.$destroy();
  });
});
