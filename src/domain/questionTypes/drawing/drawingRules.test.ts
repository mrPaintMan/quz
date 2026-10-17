import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { drawingRules } from "./drawingRules";

const validContent: ContentOf<"drawing"> = { type: "drawing", maxPoints: 3 };

describe("drawingRules", () => {
  it("gives the set max points", () => {
    expect(drawingRules.maxPoints(validContent)).toBe(3);
  });

  it("requires a time limit, since the drawing submits itself when time runs out", () => {
    expect(drawingRules.requiresTimeLimit).toBe(true);
  });

  it("finds no problems in a complete question", () => {
    expect(drawingRules.findProblems(validContent)).toEqual([]);
  });

  it("flags zero max points", () => {
    expect(drawingRules.findProblems({ ...validContent, maxPoints: 0 })).toEqual([
      { message: "Maxpoängen måste vara större än 0." },
    ]);
  });
});
