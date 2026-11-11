import { describe, expect, it } from "vitest";
import { describeNumberScoring } from "./describeNumberScoring";

describe("describeNumberScoring", () => {
  it("lists the levels from the closest, skipping one without a distance", () => {
    const tiers = [
      { within: 5, points: 1 },
      { within: 0, points: 3 },
      { within: 1.5, points: 2.5 },
      { within: null, points: 9 },
    ];
    expect(describeNumberScoring({ type: "number", answer: 9, scoring: { mode: "tiers", tiers } })).toEqual([
      "Poängnivåer",
      "Exakt rätt: 3 p",
      "Inom ±1,5: 2,5 p",
      "Inom ±5: 1 p",
      "Bästa nivån räknas.",
    ]);
  });

  it("lists the places for närmast vinner", () => {
    expect(describeNumberScoring({ type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3, 2, null] } })).toEqual([
      "Närmast vinner",
      "Plats 1: 3 p",
      "Plats 2: 2 p",
      "Plats 3: 0 p",
      "Lika nära delar plats.",
    ]);
  });
});
