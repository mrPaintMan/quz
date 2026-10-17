import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { sortRules } from "./sortRules";

const validContent: ContentOf<"sort"> = {
  type: "sort",
  items: ["Kalle Anka", "Ensam hemma", "Love Actually"],
  firstLabel: "Äldst",
  lastLabel: "Nyast",
  pointsPerItem: 1,
};

const messagesFor = (content: ContentOf<"sort">) =>
  sortRules.findProblems(content).map((problem) => problem.message);

describe("sortRules", () => {
  it("gives points per item times the number of items as max points", () => {
    expect(sortRules.maxPoints(validContent)).toBe(3);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for at least two items", () => {
    expect(messagesFor({ ...validContent, items: ["Kalle Anka"] })).toEqual(["Lägg till minst 2 saker att sortera."]);
  });

  it("flags an item without text", () => {
    expect(messagesFor({ ...validContent, items: ["Kalle Anka", ""] })).toEqual(["Sak 2 saknar text."]);
  });

  it("asks for the end labels", () => {
    expect(messagesFor({ ...validContent, lastLabel: "" })).toEqual([
      "Ange vad början och slutet betyder, till exempel Äldst och Nyast.",
    ]);
  });

  it("flags zero points per item", () => {
    expect(messagesFor({ ...validContent, pointsPerItem: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });

  it("flags two items with the same text", () => {
    expect(messagesFor({ ...validContent, items: ["Ensam hemma", "ensam hemma "] })).toEqual([
      "Två saker har samma text, så ordningen blir tvetydig.",
    ]);
  });
});
