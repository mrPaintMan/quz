import { describe, expect, it } from "vitest";
import { formatDecimal } from "./formatDecimal";

describe("formatDecimal", () => {
  it("writes decimals with a comma", () => {
    expect(formatDecimal(0.5)).toBe("0,5");
    expect(formatDecimal(66)).toBe("66");
  });

  it("shows an empty input for a missing value", () => {
    expect(formatDecimal(null)).toBe("");
    expect(formatDecimal(null)).toBe("");
  });
});
