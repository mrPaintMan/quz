import { describe, expect, it } from "vitest";
import { fieldTitle } from "./fieldTitle";

describe("fieldTitle", () => {
  it("gives the letter and label", () => {
    expect(fieldTitle(["Artist", "Låt"], 1)).toBe("b) Låt");
  });

  it("names a blank label by its letter", () => {
    expect(fieldTitle(["Artist", " "], 1)).toBe("Delfråga b)");
  });

  it("trims the label", () => {
    expect(fieldTitle([" Artist "], 0)).toBe("a) Artist");
  });
});
