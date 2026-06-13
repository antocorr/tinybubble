import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("components props and emits", () => {
  it("updates reactive props and receives child emits", async () => {
    const ChildBox = {
      name: "ChildBox",
      props: ["title", "count"],
      emits: ["pick"],
      template() {
        return `
          <div>
            <p id="child-title">{{ title }}</p>
            <button id="send" @click="notify">Emit</button>
          </div>
        `;
      },
      notify() {
        this.emit("pick", this.props.count);
      },
    };

    const App = {
      name: "App",
      components: {
        "child-box": ChildBox,
      },
      template() {
        return `
          <div>
            <child-box
              :title="'Count: ' + counter"
              :count="counter"
              -x-on:pick="onPick"
            ></child-box>
            <button id="inc" @click="inc">Inc</button>
            <p id="picked">{{ picked }}</p>
          </div>
        `;
      },
      data() {
        return {
          counter: 1,
          picked: 0,
        };
      },
      inc() {
        this.data.counter.value += 1;
      },
      onPick(value) {
        this.data.picked.value = value;
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelector("#child-title").textContent).toContain("Count: 1");

    host.querySelector("#inc").click();
    await flushMicrotasks();

    expect(host.querySelector("#child-title").textContent).toContain("Count: 2");

    host.querySelector("#send").click();
    await flushMicrotasks();

    expect(host.querySelector("#picked").textContent).toContain("2");
  });

  it("matches kebab listeners to camelCase emits", async () => {
    const ChildBox = {
      emits: ["reservationUpdate"],
      template() {
        return `<button id="send-update" @click="notify">Emit</button>`;
      },
      notify() {
        this.emit("reservationUpdate", "updated");
      },
    };

    const App = {
      components: {
        "child-box": ChildBox,
      },
      template() {
        return `
          <div>
            <child-box @reservation-update="onReservationUpdate"></child-box>
            <p id="status">{{ status }}</p>
          </div>
        `;
      },
      data() {
        return { status: "idle" };
      },
      onReservationUpdate(value) {
        this.data.status.value = value;
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    host.querySelector("#send-update").click();
    await flushMicrotasks();

    expect(host.querySelector("#status").textContent).toContain("updated");
  });
});
