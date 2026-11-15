import { describe, expect, it } from "vitest";
import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  it("groups the whole part in threes, and keeps a decimal comma", () => {
    expect(formatNumber(4500000)).toBe("4 500 000");
    expect(formatNumber(1234.5)).toBe("1 234,5");
    expect(formatNumber(-12000)).toBe("-12 000");
    expect(formatNumber(999)).toBe("999");
  });
});
