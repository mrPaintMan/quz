import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { ingredientsRules } from "./ingredientsRules";

const validContent: ContentOf<"ingredients"> = {
  type: "ingredients",
  items: [{ spellings: ["glögg"] }, { spellings: ["apelsin", "apelsinjuice"] }],
  pointsPerItem: 1,
  fuzzy: true,
};

const messagesFor = (content: ContentOf<"ingredients">) =>
  ingredientsRules.findProblems(content).map((problem) => problem.message);

describe("ingredientsRules", () => {
  it("gives points per item times the number of items as max points", () => {
    expect(ingredientsRules.maxPoints(validContent)).toBe(2);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for at least one ingredient", () => {
    expect(messagesFor({ ...validContent, items: [] })).toEqual(["Lägg till minst en ingrediens."]);
  });

  it("flags an ingredient without any spelling", () => {
    const items = [validContent.items[0], { spellings: [""] }];
    expect(messagesFor({ ...validContent, items })).toEqual(["Ingrediens 2 saknar text."]);
  });

  it("flags zero points per item", () => {
    expect(messagesFor({ ...validContent, pointsPerItem: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });
});
