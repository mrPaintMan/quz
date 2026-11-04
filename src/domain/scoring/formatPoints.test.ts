import { describe, expect, it } from "vitest";
import { formatPoints } from "./formatPoints";

describe("formatPoints", () => {
  it.each([
    [12, "12 p"],
    [2.5, "2,5 p"],
    [0, "0 p"],
  ])("shows %s as %s", (points, text) => {
    expect(formatPoints(points)).toBe(text);
  });
});
