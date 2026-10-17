import type { QuestionContent } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { findQuestionProblems } from "./findQuestionProblems";

const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const drawing: QuestionContent = { type: "drawing", maxPoints: 3 };

const messagesFor = (question: Parameters<typeof findQuestionProblems>[0]) =>
  findQuestionProblems(question).map((problem) => problem.message);

describe("findQuestionProblems", () => {
  it("finds no problems in a complete question", () => {
    expect(messagesFor({ prompt: "Pepparkakshus", timeLimitSeconds: null, content: activity })).toEqual([]);
  });

  it("asks for the prompt shown on the TV", () => {
    expect(messagesFor({ prompt: " ", timeLimitSeconds: null, content: activity })).toEqual([
      "Skriv frågan som visas på TV:n.",
    ]);
  });

  it("asks for a time limit when the type requires one", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: null, content: drawing })).toEqual([
      "Den här frågetypen behöver en tidsgräns.",
    ]);
  });

  it("flags a time limit of zero", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: 0, content: drawing })).toEqual([
      "Tidsgränsen måste vara större än 0.",
    ]);
  });

  it("includes the problems of the question type", () => {
    expect(
      messagesFor({ prompt: "Pepparkakshus", timeLimitSeconds: null, content: { type: "activity", maxPoints: 0 } }),
    ).toEqual(["Maxpoängen måste vara större än 0."]);
  });

  it("flags a time limit that is not a number", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: Number.NaN, content: drawing })).toEqual([
      "Tidsgränsen måste vara större än 0.",
    ]);
  });
});
