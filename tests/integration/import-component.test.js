import { describe, expect, it } from "vitest";
import { importComponent } from "../../src/index.js";

describe("importComponent", () => {
  it("imports component modules by URL and mounts them", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const src = "../../tests/fixtures/AsyncWidget.js";

    const comp = await importComponent(src, undefined, { label: "Widget loaded" });
    comp.appendTo(host);

    expect(host.querySelector("#async-widget")).not.toBeNull();
    expect(host.querySelector("#async-widget").textContent).toContain("Widget loaded");
  });
});
