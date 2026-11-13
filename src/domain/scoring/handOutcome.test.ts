import { describe, expect, it } from "vitest";
import { handOutcome } from "./handOutcome";

describe("handOutcome", () => {
  it("waits for the hosts' points", () => {
    expect(handOutcome(null)).toEqual({ points: 0, parts: [{ label: "", given: "", result: "pending", correct: "", points: 0 }] });
  });

  it("lights up points above 0, and counts 0 as given", () => {
    expect(handOutcome(2.5).parts[0]).toMatchObject({ result: "right", points: 2.5 });
    expect(handOutcome(0)).toEqual({ points: 0, parts: [{ label: "", given: "", result: "wrong", correct: "", points: 0 }] });
  });
});
