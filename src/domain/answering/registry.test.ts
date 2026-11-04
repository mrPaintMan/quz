import { describe, expect, it } from "vitest";
import { answeringOf, isAnswerComplete } from "./registry";

describe("answeringOf", () => {
  it("gives a built type's answering", () => {
    const content = { type: "multipleChoice" as const, options: [], correctIndex: null, points: 1 };
    expect(answeringOf(content)?.show(content)).toEqual({ type: "multipleChoice", options: [] });
  });

  it("gives none for an activity or a type not built yet", () => {
    expect(answeringOf({ type: "activity", maxPoints: 5 })).toBeNull();
    expect(answeringOf({ type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3] } })).toBeNull();
  });
});

describe("isAnswerComplete", () => {
  it("asks the answer's own type", () => {
    const shown = { type: "multipleChoice" as const, options: [{ text: "Sverige", imageId: null }] };
    expect(isAnswerComplete(shown, { type: "multipleChoice", optionIndex: 0 })).toBe(true);
    expect(isAnswerComplete(shown, { type: "multipleChoice", optionIndex: null })).toBe(false);
    expect(isAnswerComplete(null, { type: "multipleChoice", optionIndex: 0 })).toBe(false);
  });

  it("counts an answer of a type not built yet as complete", () => {
    expect(isAnswerComplete(null, { type: "number", value: null })).toBe(true);
  });
});
