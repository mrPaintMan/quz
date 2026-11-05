import { describe, expect, it } from "vitest";
import type { QuestionContent } from "@convex/questions/questionContent";
import { gradeAnswers } from "./gradeAnswers";

const choice: QuestionContent = { type: "multipleChoice", options: [{ text: "A", imageId: null }, { text: "B", imageId: null }], correctIndex: 1, points: 2 };
const pick = (optionIndex: number) => ({ type: "multipleChoice" as const, optionIndex });

describe("gradeAnswers", () => {
  it("grades each answer by the question's own type, in order", () => {
    expect(gradeAnswers(choice, [pick(1), pick(0)])).toEqual([2, 0]);
  });

  it("scores nothing for an answer that no longer fits its question, and grades the rest", () => {
    expect(gradeAnswers(choice, [{ type: "number", value: 1 }, pick(1)])).toEqual([0, 2]);
  });

  it("scores nothing for a question without automatic grading", () => {
    expect(gradeAnswers({ type: "activity", maxPoints: 5 }, [{ type: "number", value: 1 }])).toEqual([0]);
  });
});
