import { describe, expect, it } from "vitest";
import { pointsOf } from "@/domain/answering/outcome";
import type { ContentOf } from "@convex/questions/questionContent";
import { matchAnswering } from "./matchAnswering";

const content: ContentOf<"match"> = {
  type: "match",
  pairs: [
    { left: "Dancing Queen", right: "ABBA" },
    { left: "The Look", right: "Roxette" },
    { left: "Waterloo", right: "ABBA" },
  ],
  pointsPerPair: 1,
};
const joined = (...rightByLeft: (string | null)[]) => ({ type: "match" as const, rightByLeft });

describe("matchAnswering", () => {
  it("shows the left-hand items in order and the right-hand ones shuffled", () => {
    const shown = matchAnswering.show(content);
    expect(shown.left).toEqual(["Dancing Queen", "The Look", "Waterloo"]);
    expect([...shown.right].sort()).toEqual(["ABBA", "ABBA", "Roxette"]);
    expect(shown.right).not.toEqual(["ABBA", "Roxette", "ABBA"]);
  });

  it("reveals the right pairs", () => {
    expect(matchAnswering.reveal(content)).toEqual({ type: "match", pairs: content.pairs });
  });

  it("starts with nothing paired", () => {
    expect(matchAnswering.startingAnswer(matchAnswering.show(content))).toBeNull();
  });

  it("can be sent once at least one pair is made, from the items shown", () => {
    const shown = matchAnswering.show(content);
    expect(matchAnswering.isComplete(shown, joined("ABBA", null, null))).toBe(true);
    expect(matchAnswering.isComplete(shown, joined("ABBA", "Roxette", "ABBA"))).toBe(true);
    expect(matchAnswering.isComplete(shown, joined(null, null, null))).toBe(false);
    expect(matchAnswering.isComplete(shown, joined("Kent", null, null))).toBe(false);
    expect(matchAnswering.isComplete(shown, joined("Roxette", "Roxette", null))).toBe(false);
    expect(matchAnswering.isComplete(shown, joined("ABBA"))).toBe(false);
  });

  it("scores nothing for an answer using an item more often than it is shown", () => {
    expect(pointsOf(matchAnswering.outcomes(content, [joined("ABBA", "ABBA", "ABBA")]))).toEqual([0]);
  });

  it("scores the points per pair for each right pair, either copy of a repeated item counting", () => {
    expect(pointsOf(matchAnswering.outcomes(content, [joined("ABBA", "Roxette", "ABBA"), joined("Roxette", null, "ABBA"), joined(null, null, null)]))).toEqual([3, 1, 0]);
  });

  it("says for each left-hand item what the team joined it to and its right pair", () => {
    expect(matchAnswering.outcomes(content, [joined("ABBA", null, "Roxette")])[0].parts).toEqual([
      { label: "Dancing Queen", given: "ABBA", result: "right", correct: "ABBA", points: 1 },
      { label: "The Look", given: "", result: "wrong", correct: "Roxette", points: 0 },
      { label: "Waterloo", given: "Roxette", result: "wrong", correct: "ABBA", points: 0 },
    ]);
  });
});
