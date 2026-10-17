import { describe, expect, it } from "vitest";
import { normalizeForComparison } from "./normalizeForComparison";

describe("normalizeForComparison", () => {
  it("trims surrounding spaces and lowercases, including å, ä and ö", () => {
    expect(normalizeForComparison("  ÅRE Över ")).toBe("åre över");
  });
});
