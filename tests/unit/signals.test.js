import { describe, expect, it } from "vitest";
import { Signal, createSignal, effect, watch } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("signals", () => {
  it("batches multiple synchronous updates in one effect flush", async () => {
    const [getCount, setCount] = createSignal(0);
    const seen = [];

    effect(() => {
      seen.push(getCount());
    });

    setCount(1);
    setCount(2);
    setCount(3);

    await flushMicrotasks();

    expect(seen).toEqual([0, 3]);
  });

  it("tracks object mutations through proxy refresh", async () => {
    const state = Signal({ count: 1 });
    const seen = [];

    effect(() => {
      seen.push(state.value.count);
    });

    state.value.count = 2;
    await flushMicrotasks();

    expect(seen).toEqual([1, 2]);
  });

  it("watch provides current and previous values", async () => {
    const counter = Signal(10);
    const changes = [];

    watch(counter, (value, oldValue) => {
      changes.push([value, oldValue]);
    });

    counter.value = 11;
    await flushMicrotasks();
    counter.value = 12;
    await flushMicrotasks();

    expect(changes).toEqual([
      [11, 10],
      [12, 11],
    ]);
  });

  it("keeps tracking the outer effect after a nested effect is created", async () => {
    const inner = Signal(0);
    const outer = Signal("a");
    const outerRuns = [];

    effect(() => {
      // creating a nested effect must not clobber the outer effect's tracking
      effect(() => {
        inner.value;
      });
      outerRuns.push(outer.value);
    });

    outer.value = "b";
    await flushMicrotasks();

    expect(outerRuns).toEqual(["a", "b"]);
  });

  it("dispose unsubscribes the effect from its signals immediately", async () => {
    const sig = Signal(0);
    const seen = [];

    const dispose = effect(() => {
      seen.push(sig.value);
    });

    expect(sig._subscribers.size).toBe(1);
    dispose();
    expect(sig._subscribers.size).toBe(0);

    sig.value = 1;
    await flushMicrotasks();

    expect(seen).toEqual([0]);
  });

  it("watch does not track signals read inside callback", async () => {
    const source = Signal("a");
    const local = Signal(0);
    const changes = [];

    watch(source, (value) => {
      changes.push([value, local.value]);
    });

    source.value = "b";
    await flushMicrotasks();

    local.value = 1;
    await flushMicrotasks();

    expect(changes).toEqual([["b", 0]]);
  });
});
