import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { paSparetRules } from "./paSparetRules";

const clue = (points: number, text = `Ledtråd värd ${points}`) => ({ text, points });

const validContent: ContentOf<"paSparet"> = {
  type: "paSparet",
  acceptedAnswers: ["Kiruna"],
  fuzzy: true,
  clues: [clue(10), clue(8), clue(6), clue(4), clue(2)],
};

const messagesFor = (content: ContentOf<"paSparet">) =>
  paSparetRules.findProblems(content).map((problem) => problem.message);

describe("paSparetRules", () => {
  it("gives the first clue's points as max points", () => {
    expect(paSparetRules.maxPoints(validContent)).toBe(10);
  });

  it("gives 0 max points before any clue exists", () => {
    expect(paSparetRules.maxPoints({ ...validContent, clues: [] })).toBe(0);
  });

  it("finds no problems in a complete trip", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for the destination", () => {
    expect(messagesFor({ ...validContent, acceptedAnswers: [] })).toEqual(["Ange resmålet."]);
  });

  it("asks for at least one clue", () => {
    expect(messagesFor({ ...validContent, clues: [] })).toEqual(["Lägg till minst en ledtråd."]);
  });

  it("flags a clue without text and a clue worth zero points", () => {
    expect(messagesFor({ ...validContent, clues: [clue(10, " "), clue(0)] })).toEqual([
      "Ledtråd 1 saknar text.",
      "Ledtråd 2: poängen måste vara större än 0.",
    ]);
  });

  it("flags clues that do not get cheaper", () => {
    expect(messagesFor({ ...validContent, clues: [clue(10), clue(10)] })).toEqual([
      "Varje ledtråd ska ge färre poäng än den före.",
    ]);
  });
});
