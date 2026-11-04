import { describe, expect, it } from "vitest";
import type { QuestionContent } from "@convex/questions/questionContent";
import { gradeAnswer } from "./gradeAnswer";

const choice: QuestionContent = { type: "multipleChoice", options: [{ text: "A", imageId: null }, { text: "B", imageId: null }], correctIndex: 1, points: 2 };

describe("gradeAnswer", () => {
  it("grades by the question's own type", () => {
    expect(gradeAnswer(choice, { type: "multipleChoice", optionIndex: 1 })).toBe(2);
    expect(gradeAnswer(choice, { type: "multipleChoice", optionIndex: 0 })).toBe(0);
  });

  it("scores nothing for an answer that no longer fits its question", () => {
    expect(gradeAnswer(choice, { type: "number", value: 1 })).toBe(0);
  });

  it("scores nothing for a type whose grading isn't built yet", () => {
    expect(gradeAnswer({ type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3] } }, { type: "number", value: 9 })).toBe(0);
  });
});
