import { describe, expect, it } from "vitest";
import { isSameTimer } from "./isSameTimer";

describe("isSameTimer", () => {
  it("matches running timers with the same end", () => {
    expect(isSameTimer({ kind: "running", endsAt: 5 }, { kind: "running", endsAt: 5 })).toBe(true);
    expect(isSameTimer({ kind: "running", endsAt: 5 }, { kind: "running", endsAt: 6 })).toBe(false);
  });

  it("matches paused timers with the same time left", () => {
    expect(isSameTimer({ kind: "paused", remainingMs: 5 }, { kind: "paused", remainingMs: 5 })).toBe(true);
    expect(isSameTimer({ kind: "paused", remainingMs: 5 }, { kind: "paused", remainingMs: 6 })).toBe(false);
  });

  it("tells a running timer from a paused one", () => {
    expect(isSameTimer({ kind: "running", endsAt: 5 }, { kind: "paused", remainingMs: 5 })).toBe(false);
  });
});
