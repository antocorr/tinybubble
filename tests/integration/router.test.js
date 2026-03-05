import { describe, expect, it } from "vitest";
import { createComponent, createRouter } from "../../src/index.js";
import { flushMicrotasks, waitFor } from "../setup/test-helpers.js";

function mountRouterApp(router) {
  const App = {
    template() {
      return `<main><router-view/></main>`;
    },
    components: {
      "router-view": router.RouterView,
    },
  };

  const host = document.createElement("div");
  document.body.appendChild(host);

  const app = createComponent(App);
  app.appendTo(host);

  return { host, app };
}

describe("router", () => {
  it("navigates in hash mode and resolves route params", async () => {
    window.location.hash = "#/";

    const Home = {
      template() {
        return `<p id="home-page">Home</p>`;
      },
    };

    const User = {
      data() {
        return { scriptId: "" };
      },
      init() {
        this.data.scriptId.value = this.$route.params.id;
      },
      template() {
        return `<p id="user-page">User {{ scriptId }}</p>`;
      },
    };

    const router = createRouter({
      mode: "hash",
      routes: [
        { path: "/", component: Home },
        { path: "/user/:id", component: User },
      ],
    });

    mountRouterApp(router);

    await waitFor(() => {
      expect(document.querySelector("#home-page")).not.toBeNull();
    });

    router.navigate("/user/42");

    await waitFor(() => {
      expect(document.querySelector("#user-page")?.textContent).toContain("42");
    });

    expect(router.getDestination()).toBe("/user/42");
  });

  it("keeps persistent routes alive between navigations", async () => {
    window.location.hash = "#/";

    const PersistentCounter = {
      data() {
        return { count: 0 };
      },
      template() {
        return `
          <div>
            <span id="persist-count">{{ count }}</span>
            <button id="persist-inc" @click="inc">+</button>
          </div>
        `;
      },
      inc() {
        this.data.count.value += 1;
      },
    };

    const About = {
      template() {
        return `<p id="about-page">About</p>`;
      },
    };

    const router = createRouter({
      mode: "hash",
      routes: [
        { path: "/", component: About },
        { path: "/counter", component: PersistentCounter, persistent: true },
        { path: "/about", component: About },
      ],
    });

    mountRouterApp(router);

    router.navigate("/counter");
    await waitFor(() => {
      expect(document.querySelector("#persist-inc")).not.toBeNull();
    });

    document.querySelector("#persist-inc").click();
    await flushMicrotasks();
    expect(document.querySelector("#persist-count").textContent).toContain("1");

    router.navigate("/about");
    await waitFor(() => {
      expect(document.querySelector("#about-page")).not.toBeNull();
    });

    router.navigate("/counter");
    await waitFor(() => {
      expect(document.querySelector("#persist-count")).not.toBeNull();
    });

    expect(document.querySelector("#persist-count").textContent).toContain("1");
  });

  it("loads route components lazily from src", async () => {
    window.location.hash = "#/";

    const Home = {
      template() {
        return `<p id="lazy-home">Home</p>`;
      },
    };

    const router = createRouter({
      mode: "hash",
      srcBase: import.meta.url,
      routes: [
        { path: "/", component: Home },
        { path: "/lazy", src: "../fixtures/AsyncRouteComponent.js" },
      ],
    });

    mountRouterApp(router);

    router.navigate("/lazy");

    await waitFor(() => {
      expect(document.querySelector("#lazy-route")).not.toBeNull();
    });
  });
});
