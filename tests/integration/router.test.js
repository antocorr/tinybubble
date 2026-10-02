import { describe, expect, it } from "vitest";
import { createComponent, createRouter, globals, Signal } from "../../src/index.js";
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

  it("updates global route before RouterView is mounted", async () => {
    window.location.hash = "#/user/7";

    const User = {
      template() {
        return `<p>User</p>`;
      },
    };

    createRouter({
      mode: "hash",
      routes: [{ path: "/user/:id", component: User }],
    });

    await flushMicrotasks();

    expect(globals.$route.value.path).toBe("/user/7");
    expect(globals.$route.value.params.id).toBe("7");
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

  it("renders and re-renders a persistent page whose root is x-for", async () => {
    window.location.hash = "#/";

    const ListPage = {
      data() {
        return { items: ["a", "b", "c"] };
      },
      template() {
        return `<li class="list-row" x-for="item in items">{{ item }}</li>`;
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
        { path: "/list", component: ListPage, persistent: true },
        { path: "/about", component: About },
      ],
    });

    mountRouterApp(router);

    router.navigate("/list");
    await waitFor(() => {
      expect(document.querySelectorAll(".list-row").length).toBe(3);
    });

    router.navigate("/about");
    await waitFor(() => {
      expect(document.querySelector("#about-page")).not.toBeNull();
    });
    expect(document.querySelectorAll(".list-row").length).toBe(0);

    router.navigate("/list");
    await waitFor(() => {
      expect(document.querySelectorAll(".list-row").length).toBe(3);
    });
    // re-mount must not duplicate rows from the previous render
    expect(document.querySelectorAll(".list-row").length).toBe(3);
  });

  it("resolves dynamic routes once per navigation, including multiple outlets", async () => {
    window.location.hash = "#/";
    let resolutions = 0;
    const Page = { template() { return `<p class="page">Page</p>`; } };
    const router = createRouter({
      mode: "hash",
      routes: () => {
        resolutions++;
        return [{ path: "/", component: Page }, { path: "/next", component: Page }];
      },
    });
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createComponent({
      template() { return `<main><router-view></router-view><router-view></router-view></main>`; },
      components: { "router-view": router.RouterView },
    });
    app.appendTo(host);
    expect(resolutions).toBe(1);
    router.navigate("/next");
    await waitFor(() => { expect(router.getDestination()).toBe("/next"); });
    expect(resolutions).toBe(2);
    expect(host.querySelectorAll(".page")).toHaveLength(2);
    app.$destroy();
  });

  it("re-resolves function-form routes when their signal changes without navigation", async () => {
    window.location.hash = "#/";
    const active = Signal(false);
    let resolutions = 0;
    const Page = { template() { return `<p id="dynamic-page">Dynamic</p>`; } };
    const router = createRouter({
      mode: "hash",
      routes: () => {
        resolutions++;
        return active.value ? [{ path: "/", component: Page }] : [];
      },
    });
    const { app } = mountRouterApp(router);
    expect(document.querySelector("#dynamic-page")).toBeNull();
    active.value = true;
    await waitFor(() => { expect(document.querySelector("#dynamic-page")).not.toBeNull(); });
    expect(resolutions).toBe(2);
    active.value = false;
    await waitFor(() => { expect(document.querySelector("#dynamic-page")).toBeNull(); });
    expect(resolutions).toBe(3);
    app.$destroy();
  });

  it("does not track lifecycle or functional page reads in RouterView", async () => {
    window.location.hash = "#/";
    const external = Signal(0);
    let mounts = 0;
    let destroys = 0;
    let functionalRenders = 0;
    const Home = {
      template() { return `<p>Home</p>`; },
      beforeDestroy() { external.value; destroys++; },
    };
    const Page = {
      template() { return `<p>Page</p>`; },
      init() { mounts++; },
      beforeDestroy() { destroys++; },
    };
    const Functional = () => {
      external.value;
      functionalRenders++;
      return document.createElement("p");
    };
    const router = createRouter({
      mode: "hash",
      routes: [
        { path: "/", component: Home },
        { path: "/page", component: Page },
        { path: "/functional", component: Functional },
      ],
    });
    const { app } = mountRouterApp(router);
    router.navigate("/page");
    await waitFor(() => { expect(mounts).toBe(1); });
    external.value++;
    await flushMicrotasks();
    expect(mounts).toBe(1);
    expect(destroys).toBe(1);
    router.navigate("/functional");
    await waitFor(() => { expect(functionalRenders).toBe(1); });
    external.value++;
    await flushMicrotasks();
    expect(functionalRenders).toBe(1);
    app.$destroy();
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
