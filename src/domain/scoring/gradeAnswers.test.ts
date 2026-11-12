import { describe, expect, it } from "vitest";
import type { QuestionContent } from "@convex/questions/questionContent";
import { gradeAnswers, outcomesOfAnswers } from "./gradeAnswers";

const choice: QuestionContent = { type: "multipleChoice", options: [{ text: "A", imageId: null }, { text: "B", imageId: null }], correctIndex: 1, points: 2 };
const pick = (optionIndex: number) => ({ type: "multipleChoice" as const, optionIndex });

describe("gradeAnswers", () => {
  it("grades each answer by the question's own type, in order", () => {
    expect(gradeAnswers(choice, [pick(1), pick(0)], [])).toEqual([2, 0]);
  });

  it("scores nothing for an answer that no longer fits its question, and grades the rest", () => {
    expect(gradeAnswers(choice, [{ type: "number", value: 1 }, pick(1)], [])).toEqual([0, 2]);
  });

  it("scores nothing for a question without automatic grading", () => {
    expect(gradeAnswers({ type: "activity", maxPoints: 5 }, [{ type: "number", value: 1 }], [])).toEqual([0]);
  });

  it("counts the hosts' verdicts on typed answers", () => {
    const freeText: QuestionContent = { type: "freeText", fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
    const written = (text: string) => ({ type: "freeText" as const, fields: [text] });
    const verdicts = [{ slot: 0, text: "safran", target: 0 }];
    expect(gradeAnswers(freeText, [written("Safran"), written("saffran"), written("kanel")], verdicts)).toEqual([1, 1, 0]);
  });

  it("gives an answer that no longer fits its question no parts", () => {
    expect(outcomesOfAnswers(choice, [{ type: "number", value: 1 }, pick(1)], [])).toEqual([
      { points: 0, parts: [] },
      { points: 2, parts: [{ label: "", given: "B · B", result: "right", correct: "B · B", points: 2 }] },
    ]);
  });
});
