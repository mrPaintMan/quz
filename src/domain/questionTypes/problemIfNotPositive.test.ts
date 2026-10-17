import { describe, expect, it } from "vitest";
import { problemIfNotPositive } from "./problemIfNotPositive";

describe("problemIfNotPositive", () => {
  it("returns no problems for a positive value", () => {
    expect(problemIfNotPositive(2)).toEqual([]);
  });

  it.each([0, Number.NaN])("reports the points message for %s by default", (value) => {
    expect(problemIfNotPositive(value)).toEqual([{ message: "Poängen måste vara större än 0." }]);
  });

  it("uses the given message", () => {
    expect(problemIfNotPositive(0, "Radien måste vara större än 0.")).toEqual([
      { message: "Radien måste vara större än 0." },
    ]);
  });
});
