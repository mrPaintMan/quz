import { describe, expect, it } from "vitest";
import type { AnswerContent } from "./answers/answerContent";
import type { QuestionContent } from "./questions/questionContent";
import { setupConvexTest } from "./test.setup";

const oneOfEachType: QuestionContent[] = [
  { type: "multipleChoice", options: [{ text: "Sverige", imageId: null }], correctIndex: 0, points: 2 },
  { type: "multipleChoice", options: [], correctIndex: null, points: 1 },
  { type: "freeText", fields: [{ label: "", acceptedAnswers: ["kanel"] }], pointsPerField: 1, fuzzy: true },
  { type: "number", answer: null, scoring: { mode: "tiers", tiers: [] } },
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
  { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["Gruva", "Ishotell", "Norrsken", "Malmbanan", "Kyrka"] },
  { type: "activity", maxPoints: 5 },
];

const oneAnswerOfEachType: AnswerContent[] = [
  { type: "multipleChoice", optionIndex: null },
  { type: "freeText", fields: ["kanel", ""] },
  { type: "number", value: 66 },
  { type: "sort", order: [1, 0] },
  { type: "match", rightIndexByLeft: [0, null] },
  { type: "list", items: ["Oslo", "Bern"] },
  { type: "ingredients", items: ["glögg", ""] },
  { type: "drawing", strokes: [[0.1, 0.2, 0.3, 0.4]] },
  { type: "mapPin", pin: { lat: 67.85, lng: 20.23 } },
  { type: "paSparet", guess: "Kiruna", brakeClueIndex: 2 },
];

async function insertAnswer(content: unknown) {
  const t = setupConvexTest();
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
      content: { type: "activity", maxPoints: 1 },
    });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null });
    const teamId = await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
    const answerId = await ctx.db.insert("answers", { gameId, teamId, questionId, content: content as AnswerContent, lockedAt: null });
    return ctx.db.get("answers", answerId);
  });
}

async function insertQuestion(content: unknown) {
  const t = setupConvexTest();
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

  it("rejects På spåret clues that carry their own points, the shape before D30", async () => {
    await expect(
      insertQuestion({ type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: [{ text: "Gruva", points: 10 }] }),
    ).rejects.toThrow();
  });

  it("rejects content missing a field its type requires", async () => {
    await expect(insertQuestion({ type: "drawing" })).rejects.toThrow();
  });
});

describe("answers in the schema", () => {
  it.each(oneAnswerOfEachType)("stores a $type answer", async (content) => {
    const stored = await insertAnswer(content);
    expect(stored?.content).toEqual(content);
  });

  it("rejects an activity answer, since the hosts score activities", async () => {
    await expect(insertAnswer({ type: "activity" })).rejects.toThrow();
  });
});
