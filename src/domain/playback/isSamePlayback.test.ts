import { describe, expect, it } from "vitest";
import { isSamePlayback } from "./isSamePlayback";

describe("isSamePlayback", () => {
  it("matches playing clips with the same start", () => {
    expect(isSamePlayback({ kind: "playing", startedAt: 5 }, { kind: "playing", startedAt: 5 })).toBe(true);
    expect(isSamePlayback({ kind: "playing", startedAt: 5 }, { kind: "playing", startedAt: 6 })).toBe(false);
  });

  it("matches paused clips at the same spot", () => {
    expect(isSamePlayback({ kind: "paused", positionMs: 5 }, { kind: "paused", positionMs: 5 })).toBe(true);
    expect(isSamePlayback({ kind: "paused", positionMs: 5 }, { kind: "paused", positionMs: 6 })).toBe(false);
  });

  it("tells a playing clip from a paused one", () => {
    expect(isSamePlayback({ kind: "playing", startedAt: 5 }, { kind: "paused", positionMs: 5 })).toBe(false);
  });
});
