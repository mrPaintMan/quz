import { describe, expect, it } from "vitest";
import { formatPoints } from "./formatPoints";

describe("formatPoints", () => {
  it("shows points with a decimal comma", () => {
    expect(formatPoints(2)).toBe("2 p");
    expect(formatPoints(1.5)).toBe("1,5 p");
  });

  it("shows a dash when there is no fixed maximum", () => {
    expect(formatPoints(null)).toBe("– p");
    expect(formatPoints(Number.NaN)).toBe("– p");
  });
});
