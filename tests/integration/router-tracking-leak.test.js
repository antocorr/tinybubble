import { describe, expect, it } from "vitest";
import { createComponent, createRouter } from "../../src/index.js";
import { waitFor } from "../setup/test-helpers.js";

describe("router does not leak signal reads from a routed component's init()", () => {
  it("creates the routed component exactly once per navigation, even when init() reads $route", async () => {
    window.location.hash = "#/";

    let createCount = 0;
    let destroyCount = 0;

    const User = {
      data() {
        return { scriptId: "" };
      },
      init() {
        createCount++;
        // Reading a global Signal here is the leak vector: without `untrack`,
        // this subscribes RouterView's own effect to $route.
        this.data.scriptId.value = this.$route.params.id;
      },
      beforeDestroy() {
        destroyCount++;
      },
      template() {
        return `<p id="user-page">User {{ scriptId }}</p>`;
      },
    };

    const Home = { template() { return `<p id="home-page">Home</p>`; } };

    const router = createRouter({
      mode: "hash",
      routes: [
        { path: "/", component: Home },
        { path: "/user/:id", component: User },
      ],
    });

    const App = {
      template() { return `<main><router-view/></main>`; },
      components: { "router-view": router.RouterView },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent(App);
    app.appendTo(host);

    await waitFor(() => {
      expect(document.querySelector("#home-page")).not.toBeNull();
    });

    router.navigate("/user/42");
    await waitFor(() => {
      expect(document.querySelector("#user-page")?.textContent).toContain("42");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(createCount).toBe(1);

    router.navigate("/user/99");
    await waitFor(() => {
      expect(document.querySelector("#user-page")?.textContent).toContain("99");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(createCount).toBe(2);
    expect(destroyCount).toBe(1);
  });
});
