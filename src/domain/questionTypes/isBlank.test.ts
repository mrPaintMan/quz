import { describe, expect, it } from "vitest";
import { isBlank } from "./isBlank";

describe("isBlank", () => {
  it("treats empty and whitespace-only text as blank", () => {
    expect(isBlank("")).toBe(true);
    expect(isBlank("  \n ")).toBe(true);
  });

  it("treats text with characters as not blank", () => {
    expect(isBlank(" kanel ")).toBe(false);
  });
});
