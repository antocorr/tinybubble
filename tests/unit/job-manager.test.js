import { describe, expect, it } from "vitest";
import JobManager, { getJobManager } from "../../src/lib/JobManager.js";

describe("JobManager", () => {
  it("emits progress and finished callbacks", () => {
    const manager = new JobManager();
    const progress = [];
    let finished = 0;

    manager.addCallback("done", (perc, info) => {
      progress.push({ perc, info });
    });
    manager.addCallback("finished", () => {
      finished += 1;
    });

    manager.add(2);
    manager.start("start");
    manager.done(1, "half");
    manager.done(1, "all");

    expect(progress).toEqual([{ perc: 50, info: "half" }]);
    expect(finished).toBe(1);
  });

  it("returns singleton job managers by name", () => {
    const a = getJobManager("sync");
    const b = getJobManager("sync");
    const c = getJobManager("render");

    expect(a).toBe(b);
    expect(c).not.toBe(a);
  });
});
