import { describe, expect, it } from "vitest";
import { isAnswerFor } from "./isAnswerFor";

describe("isAnswerFor", () => {
  it("fits a question of its own type, and no other", () => {
    const answer = { type: "number" as const, value: 42 };
    expect(isAnswerFor({ type: "number", answer: 40, scoring: { mode: "closest", pointsByRank: [3] } }, answer)).toBe(true);
    expect(isAnswerFor({ type: "activity", maxPoints: 5 }, answer)).toBe(false);
  });
});
