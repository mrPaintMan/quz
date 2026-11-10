import { describe, expect, it } from "vitest";
import { answeringOf, isAnswerComplete, reviewOf, startingAnswerOf } from "./registry";

describe("answeringOf", () => {
  it("gives a built type's answering", () => {
    const content = { type: "multipleChoice" as const, options: [], correctIndex: null, points: 1 };
    expect(answeringOf(content)?.show(content)).toEqual({ type: "multipleChoice", options: [] });
  });

  it("gives none for an activity or a type not built yet", () => {
    expect(answeringOf({ type: "activity", maxPoints: 5 })).toBeNull();
    expect(answeringOf({ type: "list", acceptedItems: [], pointsPerItem: 1, fuzzy: true, aiAssist: false })).toBeNull();
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
    expect(isAnswerComplete(null, { type: "list", items: [] })).toBe(true);
  });
});

describe("startingAnswerOf", () => {
  it("asks the question's own type", () => {
    const shown = { type: "sort" as const, items: ["B", "A"], firstLabel: "", lastLabel: "" };
    expect(startingAnswerOf(shown)).toEqual({ type: "sort", order: ["B", "A"] });
    expect(startingAnswerOf({ type: "number" })).toBeNull();
  });
});

describe("reviewOf", () => {
  it("gives the review of a type with typed answers, and none for others", () => {
    const freeText = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
    expect(reviewOf(freeText)?.slots(freeText)).toEqual([{ title: "", options: [{ label: "Saffran", spellings: ["Saffran"] }] }]);
    expect(reviewOf({ type: "multipleChoice", options: [], correctIndex: null, points: 1 })).toBeNull();
    expect(reviewOf({ type: "activity", maxPoints: 5 })).toBeNull();
  });
});
