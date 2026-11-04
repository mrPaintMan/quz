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
    expect(isAnswerComplete({ type: "multipleChoice", optionIndex: 2 })).toBe(true);
    expect(isAnswerComplete({ type: "multipleChoice", optionIndex: null })).toBe(false);
  });

  it("counts an answer of a type not built yet as complete", () => {
    expect(isAnswerComplete({ type: "number", value: null })).toBe(true);
  });
});
