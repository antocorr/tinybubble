import { describe, expect, it } from "vitest";
import { evaluate } from "../../src/lib/Evaluate.js";
import { Signal } from "../../src/lib/Signals.js";

describe("evaluate", () => {
  it("evaluates expressions against scope values", () => {
    const scope = {
      qty: Signal(2),
      unitPrice: Signal(8),
      vat: 1.22,
    };

    const result = evaluate("qty * unitPrice * vat", scope);

    expect(result).toBeCloseTo(19.52, 2);
  });

  it("reads each scope value once and supports a changing scope shape", () => {
    let reads = 0;
    const scope = { get count() { reads++; return Signal(2); } };
    expect(evaluate("count + extra", scope)).toBeUndefined();
    expect(reads).toBe(1);
    scope.extra = 3;
    expect(evaluate("count + extra", scope)).toBe(5);
    expect(reads).toBe(2);
  });

  it("returns undefined on ReferenceError expressions", () => {
    const result = evaluate("missingValue + 1", {});
    expect(result).toBeUndefined();
  });

  it("can return the signal object when requested", () => {
    const count = Signal(7);
    const result = evaluate("count", { count }, null, true);
    expect(result).toBe(count);
  });
});
