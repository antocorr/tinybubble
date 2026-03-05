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
});
