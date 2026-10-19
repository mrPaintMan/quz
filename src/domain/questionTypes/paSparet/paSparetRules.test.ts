import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { paSparetRules } from "./paSparetRules";

const validContent: ContentOf<"paSparet"> = {
  type: "paSparet",
  acceptedAnswers: ["Kiruna"],
  fuzzy: true,
  clues: ["Gruva", "Ishotell", "Norrsken", "Malmbanan", "Kyrka som flyttas"],
};

const messagesFor = (content: ContentOf<"paSparet">) =>
  paSparetRules.findProblems(content).map((problem) => problem.message);

describe("paSparetRules", () => {
  it("starts a trip with five empty clues", () => {
    expect(paSparetRules.createEmptyContent().clues).toEqual(["", "", "", "", ""]);
  });

  it("is worth the first clue's 10 points at most", () => {
    expect(paSparetRules.maxPoints(validContent)).toBe(10);
  });

  it("needs the film", () => {
    expect(paSparetRules.requiresVideo).toBe(true);
  });

  it("finds no problems in a complete trip", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for the destination", () => {
    expect(messagesFor({ ...validContent, acceptedAnswers: [] })).toEqual(["Ange resmålet."]);
  });

  it("flags each clue without text", () => {
    expect(messagesFor({ ...validContent, clues: ["Gruva", " ", "Norrsken", "", "Kyrka"] })).toEqual([
      "Ledtråd 2 saknar text.",
      "Ledtråd 4 saknar text.",
    ]);
  });

  it("flags a trip that doesn't have exactly five clues", () => {
    expect(messagesFor({ ...validContent, clues: ["Gruva"] })).toEqual(["En resa har fem ledtrådar."]);
  });
});
