import { describe, expect, it } from "vitest";
import { cluePointsAt } from "./cluePointsAt";

describe("cluePointsAt", () => {
  it.each([
    [0, 10],
    [24, 8],
    [60, 6],
    [72, 4],
    [119, 2],
  ])("is worth the active clue's points at %s s into a 2-minute film", (position, points) => {
    expect(cluePointsAt(position, 120)).toBe(points);
  });
});
