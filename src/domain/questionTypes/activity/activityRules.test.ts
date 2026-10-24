import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { activityRules } from "./activityRules";

const validContent: ContentOf<"activity"> = { type: "activity", maxPoints: 5 };

describe("activityRules", () => {
  it("has no answer screen, since there is nothing to reveal", () => {
    expect(activityRules.hasAnswerScreen).toBe(false);
  });

  it("gives the set max points", () => {
    expect(activityRules.maxPoints(validContent)).toBe(5);
  });

  it("finds no problems in a complete activity", () => {
    expect(activityRules.findProblems(validContent)).toEqual([]);
  });

  it("flags zero max points", () => {
    expect(activityRules.findProblems({ ...validContent, maxPoints: 0 })).toEqual([
      { message: "Maxpoängen måste vara större än 0." },
    ]);
  });
});
