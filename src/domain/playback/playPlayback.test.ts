import { describe, expect, it } from "vitest";
import { playPlayback } from "./playPlayback";

describe("playPlayback", () => {
  it("plays on from where it was paused", () => {
    expect(playPlayback({ kind: "paused", positionMs: 4_000 }, 10_000)).toEqual({ kind: "playing", startedAt: 6_000 });
  });

  it("leaves a playing clip as it is", () => {
    const playing = { kind: "playing" as const, startedAt: 6_000 };
    expect(playPlayback(playing, 10_000)).toBe(playing);
  });
});
