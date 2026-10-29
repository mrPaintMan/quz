import { describe, expect, it } from "vitest";
import { pauseTimer } from "./pauseTimer";

describe("pauseTimer", () => {
  it("keeps the time left", () => {
    expect(pauseTimer({ kind: "running", endsAt: 31_000 }, 11_000)).toEqual({ kind: "paused", remainingMs: 20_000 });
  });

  it("keeps no time when the time is already out", () => {
    expect(pauseTimer({ kind: "running", endsAt: 31_000 }, 40_000)).toEqual({ kind: "paused", remainingMs: 0 });
  });

  it("leaves a paused timer as it is", () => {
    const paused = { kind: "paused" as const, remainingMs: 5_000 };
    expect(pauseTimer(paused, 40_000)).toBe(paused);
  });
});
