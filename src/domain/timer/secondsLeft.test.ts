import { describe, expect, it } from "vitest";
import { secondsLeft } from "./secondsLeft";

describe("secondsLeft", () => {
  it("rounds up, so a started second still counts", () => {
    expect(secondsLeft({ kind: "running", endsAt: 31_000 }, 11_500)).toBe(20);
  });

  it("is 0 once the time is out", () => {
    expect(secondsLeft({ kind: "running", endsAt: 31_000 }, 40_000)).toBe(0);
  });

  it("stands still while paused", () => {
    expect(secondsLeft({ kind: "paused", remainingMs: 4_200 }, 99_000)).toBe(5);
  });
});
