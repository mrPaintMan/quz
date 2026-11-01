import { describe, expect, it } from "vitest";
import { playbackPositionMs } from "./playbackPositionMs";

describe("playbackPositionMs", () => {
  it("counts from the start while playing", () => {
    expect(playbackPositionMs({ kind: "playing", startedAt: 6_000 }, 10_000)).toBe(4_000);
  });

  it("is never before the start, whatever this device's clock says", () => {
    expect(playbackPositionMs({ kind: "playing", startedAt: 6_000 }, 5_000)).toBe(0);
  });

  it("stands still while paused", () => {
    expect(playbackPositionMs({ kind: "paused", positionMs: 4_000 }, 99_000)).toBe(4_000);
  });
});
