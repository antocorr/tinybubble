import { afterEach, beforeEach } from "vitest";
import { globals } from "../../src/lib/Reactivity.js";

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

beforeEach(() => {
  for (const key of Object.keys(globals)) {
    delete globals[key];
  }

  document.body.innerHTML = "";
  document.head.innerHTML = "";
  window.history.replaceState(null, "", "/");
  window.location.hash = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});
