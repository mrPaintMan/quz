import { describe, expect, it } from "vitest";
import { isPositive } from "./isPositive";

describe("isPositive", () => {
  it("is true for numbers above zero", () => {
    expect(isPositive(0.5)).toBe(true);
  });

  it.each([0, -1, Number.NaN])("is false for %s", (value) => {
    expect(isPositive(value)).toBe(false);
  });
});
