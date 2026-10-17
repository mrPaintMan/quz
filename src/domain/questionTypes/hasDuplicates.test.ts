import { describe, expect, it } from "vitest";
import { hasDuplicates } from "./hasDuplicates";

describe("hasDuplicates", () => {
  it("is false when every value is different", () => {
    expect(hasDuplicates(["Oslo", "Rom"])).toBe(false);
  });

  it("treats values that differ only in case or surrounding spaces as duplicates", () => {
    expect(hasDuplicates(["Åre", " åre "])).toBe(true);
  });

  it("ignores blank values", () => {
    expect(hasDuplicates(["", " ", "Oslo"])).toBe(false);
  });
});
