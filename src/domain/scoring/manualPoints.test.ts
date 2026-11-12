import { describe, expect, it } from "vitest";
import { isHandPoints, isCorrection, roundPoints } from "./manualPoints";

describe("roundPoints", () => {
  it("keeps two decimals", () => {
    expect(roundPoints(2.505)).toBe(2.51);
    expect(roundPoints(-1.333)).toBe(-1.33);
  });
});

describe("isHandPoints", () => {
  it("allows 0 up to the activity's most, halves included", () => {
    expect(isHandPoints(0, 5)).toBe(true);
    expect(isHandPoints(4.5, 5)).toBe(true);
    expect(isHandPoints(5.5, 5)).toBe(false);
    expect(isHandPoints(-1, 5)).toBe(false);
    expect(isHandPoints(Number.NaN, 5)).toBe(false);
    expect(isHandPoints(12, null)).toBe(true);
  });
});

describe("isCorrection", () => {
  it("adds or takes away points, but not nothing", () => {
    expect(isCorrection(2)).toBe(true);
    expect(isCorrection(-1)).toBe(true);
    expect(isCorrection(0)).toBe(false);
    expect(isCorrection(0.001)).toBe(false);
    expect(isCorrection(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
