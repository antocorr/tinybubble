import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

function makeApp() {
  return {
    template() {
      return `
        <div>
          <button id="reverse" @click="reverse">Reverse</button>
          <button id="relabel" @click="relabel">Relabel</button>
          <ul>
            <li class="row" x-for="item in items" :key="item.id">
              <span class="label">{{ item.label }}</span>
              <input class="note">
            </li>
          </ul>
        </div>
      `;
    },
    data() {
      return {
        items: [
          { id: "a", label: "Alpha" },
          { id: "b", label: "Bravo" },
          { id: "c", label: "Charlie" },
        ],
      };
    },
    reverse() {
      this.data.items.value = [...this.data.items.value].reverse();
    },
    relabel() {
      // same ids, brand-new objects with changed labels
      this.data.items.value = this.data.items.value.map((item) => ({
        id: item.id,
        label: item.label.toUpperCase(),
      }));
    },
  };
}

function mount(App) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  createComponent(App).appendTo(host);
  return host;
}

function rowsByLabel(host) {
  const map = {};
  host.querySelectorAll(".row").forEach((li) => {
    map[li.querySelector(".label").textContent.trim()] = li;
  });
  return map;
}

describe("keyed x-for", () => {
  it("reuses the same DOM node when the list is reordered", async () => {
    const host = mount(makeApp());
    const before = rowsByLabel(host);

    host.querySelector("#reverse").click();
    await flushMicrotasks();

    const after = rowsByLabel(host);
    // visual order is reversed...
    const order = [...host.querySelectorAll(".label")].map((el) => el.textContent.trim());
    expect(order).toEqual(["Charlie", "Bravo", "Alpha"]);
    // ...but each label still points to the very same element instance (moved, not recreated)
    expect(after.Alpha).toBe(before.Alpha);
    expect(after.Bravo).toBe(before.Bravo);
    expect(after.Charlie).toBe(before.Charlie);
  });

  it("keeps unmanaged DOM state (typed input) across a reorder", async () => {
    const host = mount(makeApp());
    rowsByLabel(host).Bravo.querySelector(".note").value = "typed by user";

    host.querySelector("#reverse").click();
    await flushMicrotasks();

    expect(rowsByLabel(host).Bravo.querySelector(".note").value).toBe("typed by user");
  });

  it("does not move unchanged rows when the list is copied", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let reads = 0;
    const app = createComponent({
      data() { return { items: [{ id: "a", label: "Alpha" }, { id: "b", label: "Bravo" }] }; },
      template() { return `<ul><li x-for="item in items" :key="item.id">{{ label(item) }}</li></ul>`; },
      label(item) { reads++; return item.label; },
    });
    app.appendTo(host);
    const list = host.querySelector("ul");
    const insertBefore = list.insertBefore;
    let moves = 0;
    list.insertBefore = function (...args) { moves++; return insertBefore.apply(this, args); };
    const before = [...host.querySelectorAll("li")];
    reads = 0;
    app.data.items.value = [...app.data.items.value];
    await flushMicrotasks();
    expect([...host.querySelectorAll("li")]).toEqual(before);
    expect(moves).toBe(0);
    expect(reads).toBe(2);
    // The same object may have been mutated before assigning a new array.
    const rawItem = app.data.items.value[0];
    rawItem.label = "Changed";
    app.data.items.value = [...app.data.items.value];
    await flushMicrotasks();
    expect(host.querySelector("li").textContent).toBe("Changed");
    app.$destroy();
  });

  it("moves multi-node keyed template groups together", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent({
      data() { return { items: [{ id: "a" }, { id: "b" }, { id: "c" }] }; },
      template() {
        return `<section><template x-for="item in items" :key="item.id"><b>{{ item.id }}</b><i>{{ item.id }}</i></template></section>`;
      },
    });
    app.appendTo(host);
    const before = [...host.querySelectorAll("b, i")];
    app.data.items.value = [...app.data.items.value].reverse();
    await flushMicrotasks();
    expect([...host.querySelectorAll("b, i")].map((el) => `${el.tagName}:${el.textContent}`)).toEqual([
      "B:c", "I:c", "B:b", "I:b", "B:a", "I:a",
    ]);
    expect([...host.querySelectorAll("b, i")].slice(0, 2)).toEqual(before.slice(4, 6));
    app.$destroy();
  });

  it("updates content when the same key receives new data", async () => {
    const host = mount(makeApp());
    const before = rowsByLabel(host);

    host.querySelector("#relabel").click();
    await flushMicrotasks();

    const labels = [...host.querySelectorAll(".label")].map((el) => el.textContent.trim());
    expect(labels).toEqual(["ALPHA", "BRAVO", "CHARLIE"]);
    // node reused, only the binding re-ran
    expect(host.querySelector(".row")).toBe(before.Alpha);
  });
});
