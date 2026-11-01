import { describe, expect, it } from "vitest";
import { isTrip } from "./isTrip";

describe("isTrip", () => {
  it("tells the trip from other questions", () => {
    expect(isTrip({ type: "paSparet", acceptedAnswers: ["Oslo"], fuzzy: true, clues: [] })).toBe(true);
    expect(isTrip({ type: "activity", maxPoints: 5 })).toBe(false);
  });
});
