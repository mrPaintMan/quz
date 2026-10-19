import { describe, expect, it } from "vitest";
import { formatClock } from "./formatClock";

describe("formatClock", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [120, "2:00"],
    [125.4, "2:05"],
    [59.6, "1:00"],
  ])("shows %s seconds as %s", (seconds, text) => {
    expect(formatClock(seconds)).toBe(text);
  });
});
