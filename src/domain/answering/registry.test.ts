import { describe, expect, it } from "vitest";
import { answeringOf, fitsAnswerLimits, isAnswerComplete, MAX_TYPED_TEXT_LENGTH, MAX_TYPED_TEXTS, reviewOf, startingAnswerOf } from "./registry";

describe("answeringOf", () => {
  it("gives a built type's answering", () => {
    const content = { type: "multipleChoice" as const, options: [], correctIndex: null, points: 1 };
    expect(answeringOf(content)?.show(content)).toEqual({ type: "multipleChoice", options: [] });
  });

  it("gives none for an activity or a type not built yet", () => {
    expect(answeringOf({ type: "activity", maxPoints: 5 })).toBeNull();
    expect(answeringOf({ type: "paSparet", acceptedAnswers: [], fuzzy: false, clues: [] })).toBeNull();
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
    expect(isAnswerComplete(null, { type: "paSparet", guess: "", brakeClueIndex: null })).toBe(true);
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

describe("fitsAnswerLimits", () => {
  it("asks a type with limits of its own, such as a drawing's points", () => {
    expect(fitsAnswerLimits({ type: "drawing", strokes: [{ colour: "red", points: [0.1, 0.2] }] })).toBe(true);
    expect(fitsAnswerLimits({ type: "drawing", strokes: [{ colour: "red", points: [2, 0.2] }] })).toBe(false);
  });

  it("caps how many typed texts an answer holds and how long each is", () => {
    const list = (count: number, text = "Oslo") => ({ type: "list" as const, items: Array.from({ length: count }, () => text) });
    expect(fitsAnswerLimits(list(MAX_TYPED_TEXTS))).toBe(true);
    expect(fitsAnswerLimits(list(MAX_TYPED_TEXTS + 1))).toBe(false);
    expect(fitsAnswerLimits({ type: "freeText", fields: ["x".repeat(MAX_TYPED_TEXT_LENGTH)] })).toBe(true);
    expect(fitsAnswerLimits({ type: "freeText", fields: ["x".repeat(MAX_TYPED_TEXT_LENGTH + 1)] })).toBe(false);
  });

  it("lets answers without typed texts through", () => {
    expect(fitsAnswerLimits({ type: "number", value: 3 })).toBe(true);
  });
});
