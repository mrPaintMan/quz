/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import type { QuestionContent } from "./questions/questionContent";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const oneOfEachType: QuestionContent[] = [
  { type: "multipleChoice", options: [{ text: "Sverige", imageId: null }], correctIndex: 0, points: 2 },
  { type: "freeText", fields: [{ label: "", acceptedAnswers: ["kanel"] }], pointsPerField: 1, fuzzy: true },
  { type: "number", answer: 66, scoring: { mode: "tiers", tiers: [{ within: 6, points: 1 }] } },
  { type: "number", answer: 600000, scoring: { mode: "closest", pointsByRank: [3, 2, 1] } },
  { type: "sort", items: ["A", "B"], firstLabel: "Äldst", lastLabel: "Nyast", pointsPerItem: 1 },
  { type: "match", pairs: [{ left: "Oslo", right: "Norge" }], pointsPerPair: 1 },
  { type: "list", acceptedItems: [], pointsPerItem: 0.5, fuzzy: true, aiAssist: true },
  { type: "ingredients", items: [{ spellings: ["glögg"] }], pointsPerItem: 1, fuzzy: true },
  { type: "drawing", maxPoints: 3 },
  {
    type: "mapPin",
    target: { lat: 67.85, lng: 20.23 },
    radiusMeters: 50000,
    points: 3,
    initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
  },
  { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: [{ text: "Gruva", points: 10 }] },
  { type: "activity", maxPoints: 5 },
];

async function insertQuestion(content: unknown) {
  const t = convexTest(schema, modules);
  return t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "",
      timeLimitSeconds: null,
      media: null,
      hostNotes: "",
      content: content as QuestionContent,
    });
    return ctx.db.get("questions", questionId);
  });
}

describe("schema", () => {
  it.each(oneOfEachType)("stores a $type question", async (content) => {
    const stored = await insertQuestion(content);
    expect(stored?.content).toEqual(content);
  });

  it("rejects content of an unknown question type", async () => {
    await expect(insertQuestion({ type: "karaoke", points: 1 })).rejects.toThrow();
  });

  it("rejects content missing a field its type requires", async () => {
    await expect(insertQuestion({ type: "drawing" })).rejects.toThrow();
  });
});
