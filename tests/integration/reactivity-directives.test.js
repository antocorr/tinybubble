import { describe, expect, it, vi } from "vitest";
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

  // ─── Event modifiers (@event.modifier) ────────────────────────────────
  // Regression: `@pointerdown.stop` was left as a raw (dead) HTML attribute
  // because bubblify only matched a bare `@event=`. Guards the board drag bug.

  it("binds @pointerdown.stop and stops propagation (card drag regression)", async () => {
    let fired = 0;
    let bubbledToBoard = 0;
    const App = {
      template() {
        return `
          <div id="board" @pointerdown="onBoardPointerDown">
            <article id="card" data-drag-task="t1" @pointerdown.stop="onCardPointerDown($event, task)">Card</article>
          </div>
        `;
      },
      data() {
        return { task: { id: "t1" } };
      },
      onBoardPointerDown() {
        bubbledToBoard += 1;
      },
      onCardPointerDown(event, task) {
        fired += 1;
        expect(event).toBeDefined();
        expect(task.id).toBe("t1");
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    const card = host.querySelector("#card");
    expect(card.getAttribute("@pointerdown")).toBeNull(); // sugar was rewritten/consumed
    card.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 10, clientY: 10 }));

    expect(fired).toBe(1);
    expect(bubbledToBoard).toBe(0); // `.stop` blocked bubbling to the board
    app.$destroy();
  });

  it("binds @click.stop so the board menu click does not leak", async () => {
    let inner = 0;
    let outer = 0;
    const App = {
      template() {
        return `<div id="col" @click="onCol"><button id="menu" data-no-drag @click.stop="onMenu">M</button></div>`;
      },
      onCol() {
        outer += 1;
      },
      onMenu() {
        inner += 1;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();
    host.querySelector("#menu").click();
    expect(inner).toBe(1);
    expect(outer).toBe(0);
    app.$destroy();
  });

  it("applies @submit.prevent (prevents default) and fires the handler", async () => {
    let prevented = false;
    let fired = 0;
    const App = {
      template() {
        return `<form @submit.prevent="onSubmit"><button type="submit">Go</button></form>`;
      },
      onSubmit(event) {
        fired += 1;
        prevented = event.defaultPrevented;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();
    host.querySelector("button").click();
    expect(fired).toBe(1);
    expect(prevented).toBe(true);
    app.$destroy();
  });

  it("filters @keydown.enter to the Enter key and passes $event", async () => {
    let enterFired = 0;
    let keyFired = 0;
    const App = {
      template() {
        return `<input id="inp" @keydown.enter="onEnter">`;
      },
      onEnter(event) {
        enterFired += 1;
        expect(event.key).toBe("Enter");
      },
    };
    const AppKey = {
      template() {
        return `<input id="inp2" @keydown="onKey">`;
      },
      onKey() {
        keyFired += 1;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    const app2 = createComponent(AppKey);
    app2.appendTo(host);
    await flushMicrotasks();

    host.querySelector("#inp").dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(enterFired).toBe(0); // non-Enter key ignored
    host.querySelector("#inp").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(enterFired).toBe(1);

    host.querySelector("#inp2").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(keyFired).toBe(1); // plain @keydown still fires for any key
    app.$destroy();
    app2.$destroy();
  });

  it("combines @keydown.enter.prevent", async () => {
    let enterFired = 0;
    let prevented = false;
    const App = {
      template() {
        return `<input id="inp" @keydown.enter.prevent="onEnter">`;
      },
      onEnter(event) {
        enterFired += 1;
        prevented = event.defaultPrevented;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();

    host.querySelector("#inp").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(enterFired).toBe(1);
    expect(prevented).toBe(true);
    // a non-Enter key is filtered out before the handler runs
    host.querySelector("#inp").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(enterFired).toBe(1);
    app.$destroy();
  });

  it.each([
    ["enter", "Enter"], ["escape", "Escape"], ["esc", "Escape"], ["tab", "Tab"],
    ["space", " "], ["spacebar", " "], ["up", "ArrowUp"], ["down", "ArrowDown"],
    ["left", "ArrowLeft"], ["right", "ArrowRight"], ["backspace", "Backspace"],
    ["delete", "Delete"], ["del", "Delete"], ["home", "Home"], ["end", "End"],
    ["pageup", "PageUp"], ["pagedown", "PageDown"],
  ])("matches .%s to %s", (modifier, key) => {
    let calls = 0;
    const app = createComponent({
      template() { return `<input @keydown.${modifier}="onKey">`; },
      onKey(event) { expect(event.key).toBe(key); calls++; },
    });
    app.$element.dispatchEvent(new KeyboardEvent("keydown", { key: "Unidentified" }));
    app.$element.dispatchEvent(new KeyboardEvent("keydown", { key }));
    expect(calls).toBe(1);
    app.$destroy();
  });

  it("preserves input handler this, current value, previous value and native event", () => {
    const seen = [];
    const app = createComponent({
      name: "InputPage",
      template() { return `<input value="initial" @input="receive">`; },
      receive(value, previous, event) { seen.push([this.name, value, previous, event]); },
    });
    const event = new Event("input", { bubbles: true });
    app.$element.value = "updated";
    app.$element.dispatchEvent(event);
    expect(seen).toEqual([["InputPage", "updated", "initial", event]]);
    app.$destroy();
  });

  it("matches arrow aliases and only prevents matching keys", () => {
    const seen = [];
    const App = {
      template() {
        return `<div><input id="arrows" @keydown.up="onUp"><input id="enter" @keydown.enter.prevent.stop="onEnter"></div>`;
      },
      onUp(event) { seen.push(event.key); },
      onEnter(event) { seen.push(event.key); },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    const parent = host.querySelector("div");
    let bubbled = 0;
    parent.addEventListener("keydown", () => { bubbled++; });

    const up = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
    host.querySelector("#arrows").dispatchEvent(up);
    const other = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    host.querySelector("#enter").dispatchEvent(other);
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    host.querySelector("#enter").dispatchEvent(enter);

    expect(seen).toEqual(["ArrowUp", "Enter"]);
    expect(other.defaultPrevented).toBe(false);
    expect(enter.defaultPrevented).toBe(true);
    expect(bubbled).toBe(2);
    app.$destroy();
  });

  it("does not prevent or consume a child event filtered by .self", () => {
    let called = 0;
    const app = createComponent({
      template() { return `<div @click.self.prevent.stop="hit"><button>Child</button></div>`; },
      hit() { called++; },
    });
    const host = document.createElement("section");
    document.body.appendChild(host);
    app.appendTo(host);
    let bubbled = 0;
    host.addEventListener("click", () => { bubbled++; });
    const childClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    host.querySelector("button").dispatchEvent(childClick);
    expect(called).toBe(0);
    expect(childClick.defaultPrevented).toBe(false);
    expect(bubbled).toBe(1);
    app.$destroy();
  });

  it("evaluates text bindings once on mount", () => {
    let reads = 0;
    const app = createComponent({
      template() { return `<p>{{ label() }}</p>`; },
      label() { reads++; return "Ready"; },
    });
    expect(app.$element.textContent).toBe("Ready");
    expect(reads).toBe(1);
    app.$destroy();
  });

  it("matches .space.prevent without cancelling unrelated keys", () => {
    let calls = 0;
    const app = createComponent({
      template() { return `<div tabindex="0" @keydown.space.prevent="onSpace"></div>`; },
      onSpace() { calls++; },
    });
    const other = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    app.$element.dispatchEvent(other);
    const space = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    app.$element.dispatchEvent(space);
    expect(calls).toBe(1);
    expect(other.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(true);
    app.$destroy();
  });

  it("consumes .once only when a key filter matches", () => {
    let calls = 0;
    const app = createComponent({
      template() { return `<input @keydown.enter.once="onEnter">`; },
      onEnter() { calls++; },
    });
    const input = app.$element;
    for (const key of ["a", "Enter", "Enter"]) {
      input.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
    expect(calls).toBe(1);
    app.$destroy();
  });

  it("runs @click.once only once", async () => {
    let onClickFired = 0;
    const App = {
      template() {
        return `<button id="onceBtn" @click.once="onClick">Once</button>`;
      },
      onClick() {
        onClickFired += 1;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();
    const btn = host.querySelector("#onceBtn");
    btn.click();
    btn.click();
    btn.click();
    expect(onClickFired).toBe(1); // listener auto-removed after first run
    app.$destroy();
  });

  it("legacy @submit-prevent suffix still prevents default", async () => {
    let prevented = false;
    const App = {
      template() {
        return `<form @submit-prevent="onSubmit"><button type="submit">Go</button></form>`;
      },
      onSubmit(event) {
        prevented = event.defaultPrevented;
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);
    await flushMicrotasks();
    host.querySelector("button").click();
    expect(prevented).toBe(true);
    app.$destroy();
  });

  it("nevers leaves raw {{ tokens }} in keyed x-for item text", async () => {
    const App = {
      template() {
        return `<ul><li x-for="item in items" :key="item.path"><i class="ic">{{ item.icon }}</i><b>{{ item.label }}</b><span>{{ item.missing ?? 'fallback' }}</span></li></ul>`;
      },
      data() {
        return {
          items: [
            { path: "a", icon: "home", label: "Home" },
            { path: "b", icon: "api", label: "Providers" },
          ],
        };
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);

    const rows = [...host.querySelectorAll("li")];
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector(".ic").textContent).toBe("home");
    expect(rows[1].querySelector(".ic").textContent).toBe("api");
    expect(rows[0].textContent).toBe("homeHomefallback");
    expect(rows[1].textContent).toBe("apiProvidersfallback");
    expect(host.textContent).not.toMatch(/\{\{|\}\}/);

    app.data.items.value = [
      { path: "a", icon: "home", label: "Dashboard" },
      { path: "b", icon: "api", label: "Providers" },
    ];
    await flushMicrotasks();
    expect(host.querySelectorAll("li")[0].textContent).toBe("homeDashboardfallback");
    expect(host.textContent).not.toMatch(/\{\{|\}\}/);
    app.$destroy();
  });

  it("interpolates child component props without leaving raw tokens", async () => {
    const Child = {
      name: "ChildCard",
      props: ["title", "message", "actionLabel"],
      template() {
        return `<div><h3>{{ title }}</h3><p>{{ message }}</p><button>{{ actionLabel || 'Retry' }}</button></div>`;
      },
    };
    const App = {
      template() {
        return `<div><child-card title="Sign in to manage providers" message="Only authenticated users can browse." action-label="Go to sign in"></child-card></div>`;
      },
      components: { "child-card": Child },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("h3").textContent).toBe("Sign in to manage providers");
    expect(host.querySelector("p").textContent).toBe("Only authenticated users can browse.");
    expect(host.querySelector("button").textContent).toBe("Go to sign in");
    expect(host.textContent).not.toMatch(/\{\{|\}\}/);
    app.$destroy();
  });

  it("never leaves raw tokens when a token expression fails to evaluate", async () => {
    const App = {
      template() {
        return `<div><p id="a">{{ greeting }}, {{ boom() }}</p><p id="b">{{ missing.x.y }}</p></div>`;
      },
      data() {
        return { greeting: "Hello" };
      },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    // Node's happy-dom console.warn is expected here (evaluate warns on TypeError)
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const app = createComponent(App);
    app.appendTo(host);
    spy.mockRestore();

    // ReferenceError tokens are suppressed and replaced with empty string;
    // the whole node is interpolated and never shows raw {{ }} markers.
    expect(host.querySelector("#a").textContent).toBe("Hello, ");
    expect(host.querySelector("#b").textContent).toBe("");
    expect(host.textContent).not.toMatch(/\{\{|\}\}/);
    app.$destroy();
  });
});
