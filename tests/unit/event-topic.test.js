import { describe, expect, it } from "vitest";
import { EventTopic } from "../../src/lib/EventTopic.js";

describe("EventTopic", () => {
  it("registers, emits and removes listeners", () => {
    const topic = new EventTopic();
    const calls = [];
    const cb = (a, b) => calls.push([a, b]);

    topic.on("sum", cb);
    topic.emit("sum", 1, 2);
    topic.off("sum", cb);
    topic.emit("sum", 9, 9);

    expect(calls).toEqual([[1, 2]]);
  });

  it("supports one-time listeners", () => {
    const topic = new EventTopic();
    const calls = [];

    topic.one("ready", (value) => calls.push(value));
    topic.emit("ready", "first");
    topic.emit("ready", "second");

    expect(calls).toEqual(["first"]);
  });

  it("reuses topic instances with the same name", () => {
    const root = new EventTopic();
    const first = root.topic("layout");
    const second = root.topic("layout");

    expect(second).toBe(first);

    root.remove("layout");
    const third = root.topic("layout");
    expect(third).not.toBe(first);
  });
});
