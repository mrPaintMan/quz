import { describe, expect, it } from "vitest";
import { isScoredByHand } from "./isScoredByHand";

describe("isScoredByHand", () => {
  it("holds for activities and drawings, not for types scored by the app", () => {
    expect(isScoredByHand({ type: "activity", maxPoints: 5 })).toBe(true);
    expect(isScoredByHand({ type: "drawing", maxPoints: 3 })).toBe(true);
    expect(isScoredByHand({ type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } })).toBe(false);
  });
});
