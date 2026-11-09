import { describe, expect, it } from "vitest";
import { normalizeForComparison } from "./normalizeForComparison";

describe("normalizeForComparison", () => {
  it("trims surrounding spaces and lowercases, including å, ä and ö", () => {
    expect(normalizeForComparison("  ÅRE Över ")).toBe("åre över");
  });

  it("treats doubled spaces and line breaks between words as one space", () => {
    expect(normalizeForComparison("vit   rom\npå is")).toBe("vit rom på is");
  });

  it("ignores a full stop or comma at the end", () => {
    expect(normalizeForComparison("Kanel.")).toBe("kanel");
    expect(normalizeForComparison("kanel, ")).toBe("kanel");
  });

  it("keeps punctuation inside the text", () => {
    expect(normalizeForComparison("St. Germain")).toBe("st. germain");
  });

  it("keeps misspellings apart", () => {
    expect(normalizeForComparison("kanell")).not.toBe(normalizeForComparison("kanel"));
  });

  it("treats an accent typed as one letter and one pasted as a letter plus a mark as equal", () => {
    expect(normalizeForComparison("Kahlu\u0301a")).toBe(normalizeForComparison("Kahl\u00faa"));
  });
});
