import { describe, expect, it } from "vitest";
import { hasSpelling } from "./hasSpelling";

describe("hasSpelling", () => {
  it("is true when at least one spelling has text", () => {
    expect(hasSpelling(["", "kanel"])).toBe(true);
  });

  it("is false for no spellings or only blank ones", () => {
    expect(hasSpelling([])).toBe(false);
    expect(hasSpelling(["", "  "])).toBe(false);
  });
});
