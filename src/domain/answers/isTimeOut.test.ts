import { describe, expect, it } from "vitest";
import { isTimeOut } from "./isTimeOut";

describe("isTimeOut", () => {
  it("never times out without a timer", () => {
    expect(isTimeOut(undefined, 99_000)).toBe(false);
  });

  it("allows 2 seconds after the server's zero for answers on their way", () => {
    const timer = { kind: "running" as const, endsAt: 10_000 };
    expect(isTimeOut(timer, 12_000)).toBe(false);
    expect(isTimeOut(timer, 12_001)).toBe(true);
  });

  it("is out while paused only with no time left", () => {
    expect(isTimeOut({ kind: "paused", remainingMs: 5_000 }, 99_000)).toBe(false);
    expect(isTimeOut({ kind: "paused", remainingMs: 0 }, 99_000)).toBe(true);
  });
});
