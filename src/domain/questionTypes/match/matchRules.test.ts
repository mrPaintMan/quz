import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { matchRules } from "./matchRules";

const validContent: ContentOf<"match"> = {
  type: "match",
  pairs: [
    { left: "Oslo", right: "Norge" },
    { left: "Rom", right: "Italien" },
  ],
  pointsPerPair: 1,
};

const messagesFor = (content: ContentOf<"match">) =>
  matchRules.findProblems(content).map((problem) => problem.message);

describe("matchRules", () => {
  it("gives points per pair times the number of pairs as max points", () => {
    expect(matchRules.maxPoints(validContent)).toBe(2);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for at least two pairs", () => {
    expect(messagesFor({ ...validContent, pairs: [validContent.pairs[0]] })).toEqual(["Lägg till minst 2 par."]);
  });

  it("flags a pair with a blank side", () => {
    const pairs = [validContent.pairs[0], { left: "Rom", right: " " }];
    expect(messagesFor({ ...validContent, pairs })).toEqual(["Par 2 saknar text på en av sidorna."]);
  });

  it("flags zero points per pair", () => {
    expect(messagesFor({ ...validContent, pointsPerPair: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });
});
