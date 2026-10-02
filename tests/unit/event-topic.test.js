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

  it("preserves callback context, argument order and fluent aliases", () => {
    const topic = new EventTopic();
    const receiver = { calls: [] };
    topic.setupApc(receiver);
    function callback(...args) { this.calls.push(args); }
    expect(topic.on("message", callback, "listener")).toBe(topic);
    expect(topic.emit("message", "hello", 42, { ok: true })).toBe(topic);
    expect(receiver.calls).toEqual([["hello", 42, { ok: true }]]);
    expect(topic.off("message", null, "listener")).toBe(topic);
    topic.emit("message", "ignored");
    expect(receiver.calls).toHaveLength(1);
  });

  it("forwards copied methods and APC calls with their original context", () => {
    const topic = new EventTopic();
    const facade = {};
    topic.copyFunctionalities(facade);
    const seen = [];
    facade.on("message", function (...args) { seen.push([this, args]); });
    facade.emit("message", "first", 2);
    expect(seen).toEqual([[topic, ["first", 2]]]);
    const receiver = {
      value: 10,
      add(a, b) { seen.push([this.value, a, b]); },
    };
    topic.setupApc(receiver);
    topic.apc("add", 3, 4);
    expect(seen[1]).toEqual([10, 3, 4]);
    topic.aset("value", 20);
    topic.apc("add", 5, 6);
    expect(seen[2]).toEqual([20, 5, 6]);
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
