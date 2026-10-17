import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { listRules } from "./listRules";

const validContent: ContentOf<"list"> = {
  type: "list",
  acceptedItems: [],
  pointsPerItem: 0.5,
  fuzzy: true,
  aiAssist: true,
};

describe("listRules", () => {
  it("has no fixed max points", () => {
    expect(listRules.maxPoints(validContent)).toBeNull();
  });

  it("requires a time limit, since the list submits itself when time runs out", () => {
    expect(listRules.requiresTimeLimit).toBe(true);
  });

  it("accepts an empty answer key", () => {
    expect(listRules.findProblems(validContent)).toEqual([]);
  });

  it("flags zero points per item", () => {
    expect(listRules.findProblems({ ...validContent, pointsPerItem: 0 })).toEqual([
      { message: "Poängen måste vara större än 0." },
    ]);
  });
});
