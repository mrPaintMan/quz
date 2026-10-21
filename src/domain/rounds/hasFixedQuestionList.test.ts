import { describe, expect, it } from "vitest";
import { hasFixedQuestionList } from "./hasFixedQuestionList";

describe("hasFixedQuestionList", () => {
  it("fixes a På spåret round's questions to its trip and films", () => {
    expect(hasFixedQuestionList("paSparet")).toBe(true);
  });

  it("lets a question round hold a free list of questions", () => {
    expect(hasFixedQuestionList("questions")).toBe(false);
  });
});
