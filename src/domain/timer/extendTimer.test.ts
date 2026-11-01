import { describe, expect, it } from "vitest";
import { extendTimer } from "./extendTimer";

describe("extendTimer", () => {
  it("adds 15 seconds to a running timer", () => {
    expect(extendTimer({ kind: "running", endsAt: 31_000 }, 11_000)).toEqual({ kind: "running", endsAt: 46_000 });
  });

  it("gives 15 seconds from now when the time is out", () => {
    expect(extendTimer({ kind: "running", endsAt: 31_000 }, 40_000)).toEqual({ kind: "running", endsAt: 55_000 });
  });

  it("adds 15 seconds to a paused timer", () => {
    expect(extendTimer({ kind: "paused", remainingMs: 5_000 }, 40_000)).toEqual({ kind: "paused", remainingMs: 20_000 });
  });
});
