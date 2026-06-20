import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("reactivity directives", () => {
  it("throws a clear error when template has no root element", () => {
    const App = {
      template() {
        return "";
      },
    };

    expect(() => createComponent(App)).toThrow("TinyBubble template must return one root element");
  });

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

  it("x-hide hides when true and shows when false", async () => {
    const App = {
      template() {
        return `
          <div>
            <button id="toggle" @click="toggle">Toggle</button>
            <div id="hidden" x-hide="gone">Hidden block</div>
          </div>
        `;
      },
      data() {
        return { gone: false };
      },
      toggle() {
        this.data.gone.value = !this.data.gone.value;
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("#hidden").style.display).toBe("");

    host.querySelector("#toggle").click();
    await flushMicrotasks();

    expect(host.querySelector("#hidden").style.display).toBe("none");

    host.querySelector("#toggle").click();
    await flushMicrotasks();

    expect(host.querySelector("#hidden").style.display).toBe("");

    app.$destroy();
  });

  it("renders rich HTML via x-html and reacts to changes", async () => {
    const App = {
      template() {
        return `<div><div id="rich" x-html="content"></div></div>`;
      },
      data() {
        return { content: "<strong>Bold</strong> text" };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    const rich = host.querySelector("#rich");
    expect(rich.querySelector("strong")).not.toBeNull();
    expect(rich.textContent).toBe("Bold text");

    app.data.content.value = "<em>Italic</em> text";
    await flushMicrotasks();

    expect(rich.querySelector("strong")).toBeNull();
    expect(rich.querySelector("em")).not.toBeNull();
    expect(rich.textContent).toBe("Italic text");

    app.$destroy();
  });

  it("x-html with null/undefined clears the element", async () => {
    const App = {
      template() {
        return `<div><div id="rich" x-html="content"></div></div>`;
      },
      data() {
        return { content: "<span>hello</span>" };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("#rich").querySelector("span")).not.toBeNull();

    app.data.content.value = null;
    await flushMicrotasks();

    expect(host.querySelector("#rich").innerHTML).toBe("");

    app.$destroy();
  });

  it("interpolates multiple {{ }} expressions in the same text node", async () => {
    const App = {
      template() {
        return `<div><p id="out">{{ greeting }}, {{ name }}! You have {{ count }} messages.</p></div>`;
      },
      data() {
        return { greeting: "Hello", name: "Mario", count: 3 };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("#out").textContent).toBe("Hello, Mario! You have 3 messages.");

    app.data.name.value = "Luigi";
    app.data.count.value = 5;
    await flushMicrotasks();

    expect(host.querySelector("#out").textContent).toBe("Hello, Luigi! You have 5 messages.");

    app.$destroy();
  });

  it("renders x-for placed on the root element", async () => {
    const App = {
      template() {
        return `<li x-for="item in items">{{ item }}</li>`;
      },
      data() {
        return { items: ["a", "b", "c"] };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    const lis = host.querySelectorAll("li");
    expect(lis.length).toBe(3);
    expect(lis[0].textContent).toContain("a");
    expect(lis[2].textContent).toContain("c");

    app.data.items.value = ["x", "y"];
    await flushMicrotasks();

    const updated = host.querySelectorAll("li");
    expect(updated.length).toBe(2);
    expect(updated[0].textContent).toContain("x");

    app.$destroy();
  });

  it("mounts and unmounts x-if placed on the root element", async () => {
    const App = {
      template() {
        return `<p x-if="open">visible</p>`;
      },
      data() {
        return { open: true };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    expect(host.querySelector("p")?.textContent).toContain("visible");

    app.data.open.value = false;
    await flushMicrotasks();
    expect(host.querySelector("p")).toBeNull();

    app.data.open.value = true;
    await flushMicrotasks();
    expect(host.querySelector("p")?.textContent).toContain("visible");

    app.$destroy();
  });

  it("renders multiple siblings from a root <template x-for>", async () => {
    const App = {
      template() {
        return `<template x-for="n in nums"><b>{{ n }}</b><i>{{ n }}</i></template>`;
      },
      data() {
        return { nums: [1, 2] };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    expect(host.querySelectorAll("b").length).toBe(2);
    expect(host.querySelectorAll("i").length).toBe(2);
    expect(host.querySelector("b").textContent).toContain("1");

    app.$destroy();
  });

  it("renders a child component whose root is x-for", async () => {
    const List = {
      props: ["rows"],
      template() {
        return `<li x-for="row in rows">{{ row }}</li>`;
      },
    };
    const App = {
      components: { "x-list": List },
      template() {
        return `<ul><x-list :rows="rows"></x-list></ul>`;
      },
      data() {
        return { rows: ["one", "two"] };
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    const lis = host.querySelectorAll("ul li");
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toContain("one");

    app.$destroy();
  });

  it("re-renders a root-directive component after the outlet is wiped (persistent re-mount)", async () => {
    const App = {
      template() {
        return `<li x-for="item in items">{{ item }}</li>`;
      },
      data() {
        return { items: ["a", "b"] };
      },
    };

    const outlet = document.createElement("div");
    document.body.appendChild(outlet);

    const app = createComponent(App);

    // initial mount
    outlet.appendChild(app.$element);
    app._renderRoot();
    await flushMicrotasks();
    expect(outlet.querySelectorAll("li").length).toBe(2);

    // navigate away: RouterView wipes the outlet, component stays alive
    outlet.innerHTML = "";
    expect(outlet.querySelectorAll("li").length).toBe(0);

    // navigate back: same component re-appended and re-rendered
    outlet.appendChild(app.$element);
    app._renderRoot();
    await flushMicrotasks();

    const lis = outlet.querySelectorAll("li");
    expect(lis.length).toBe(2); // exactly 2 — no duplicates from the stale effect
    expect(lis[0].textContent).toContain("a");
  });
});
