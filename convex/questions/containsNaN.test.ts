import { describe, expect, it } from "vitest";
import { containsNaN } from "./containsNaN";

describe("containsNaN", () => {
  it("finds NaN nested in objects and arrays", () => {
    expect(containsNaN({ scoring: { tiers: [{ within: 1, points: Number.NaN }] } })).toBe(true);
  });

  it.each([null, 3, "NaN", { points: null }, [1, 2]])("is false for %j", (value) => {
    expect(containsNaN(value)).toBe(false);
  });
});
