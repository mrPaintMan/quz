import { describe, expect, it } from "vitest";
import { maxQuestionPoints } from "./maxQuestionPoints";

describe("maxQuestionPoints", () => {
  it("gives the max points from the question type's rules", () => {
    expect(maxQuestionPoints({ type: "drawing", maxPoints: 3 })).toBe(3);
  });

  it("gives null for a question without a fixed maximum", () => {
    expect(
      maxQuestionPoints({ type: "list", acceptedItems: [], pointsPerItem: 0.5, fuzzy: true, aiAssist: false }),
    ).toBeNull();
  });
});
