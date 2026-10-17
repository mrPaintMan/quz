import { describe, expect, it } from "vitest";
import { problemIf } from "./problemIf";

describe("problemIf", () => {
  it("returns the problem when the condition holds", () => {
    expect(problemIf(true, "Fel")).toEqual([{ message: "Fel" }]);
  });

  it("returns no problems when the condition does not hold", () => {
    expect(problemIf(false, "Fel")).toEqual([]);
  });
});
