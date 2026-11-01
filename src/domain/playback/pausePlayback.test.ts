import { describe, expect, it } from "vitest";
import { pausePlayback } from "./pausePlayback";

describe("pausePlayback", () => {
  it("stops at the spot it has reached", () => {
    expect(pausePlayback({ kind: "playing", startedAt: 6_000 }, 10_000)).toEqual({ kind: "paused", positionMs: 4_000 });
  });

  it("leaves a paused clip as it is", () => {
    const paused = { kind: "paused" as const, positionMs: 4_000 };
    expect(pausePlayback(paused, 10_000)).toBe(paused);
  });
});
