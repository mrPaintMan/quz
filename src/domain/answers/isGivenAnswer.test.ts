import { describe, expect, it } from "vitest";
import { isGivenAnswer } from "./isGivenAnswer";

const drawing = { type: "drawing" as const, maxPoints: 3 };

describe("isGivenAnswer", () => {
  it("holds for a filled-in answer to the question", () => {
    expect(isGivenAnswer(drawing, { type: "drawing", strokes: [{ colour: "red", points: [0.1, 0.2] }] })).toBe(true);
  });

  it("doesn't for an empty answer, an answer of another type, or a type not answered in the app", () => {
    expect(isGivenAnswer(drawing, { type: "drawing", strokes: [] })).toBe(false);
    expect(isGivenAnswer(drawing, { type: "number", value: 3 })).toBe(false);
    expect(isGivenAnswer({ type: "activity", maxPoints: 3 }, { type: "number", value: 3 })).toBe(false);
  });
});
