import { describe, expect, it } from "vitest";
import { clueProgress } from "./clueProgress";

describe("clueProgress", () => {
  it("gives the active clue and the time to the next", () => {
    expect(clueProgress(30, 120)).toEqual({ index: 1, points: 8, secondsToNext: 18, hasEnded: false });
  });

  it("has no next for the last clue", () => {
    expect(clueProgress(100, 120)).toEqual({ index: 4, points: 2, secondsToNext: null, hasEnded: false });
  });

  it("says when the film has ended", () => {
    expect(clueProgress(120, 120).hasEnded).toBe(true);
  });
});
