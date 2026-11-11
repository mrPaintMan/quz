// Shared by the verdict tests. The extra dot in the file name keeps Convex from deploying it.
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { QuestionContent } from "../questions/questionContent";
import { host, setupConvexTest } from "../test.setup";

const freeText: QuestionContent = {
  type: "freeText",
  fields: [
    { label: "Artist", acceptedAnswers: ["ABBA"] },
    { label: "Låt", acceptedAnswers: ["Waterloo"] },
  ],
  pointsPerField: 1,
  fuzzy: true,
};

// A running game whose free-text question three teams have answered; closed unless asked not to.
export async function setup({ closed = true, content = freeText }: { closed?: boolean; content?: QuestionContent } = {}) {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Musik", kind: "questions" });
    const question = { quizId, roundId, position: 0, prompt: "Vem och vad?", timeLimitSeconds: null, media: null, hostNotes: "" };
    const questionId = await ctx.db.insert("questions", { ...question, content });
    const gameId = await ctx.db.insert("games", {
      quizId,
      endedAt: null,
      screen: { kind: "answer", questionId },
      screenIndex: 2,
      closedQuestionIds: closed ? [questionId] : [],
    });
    const answer = async (name: string, colour: "red" | "blue" | "green", fields: string[], lockedAt: number | null = 1) => {
      const teamId = await ctx.db.insert("teams", { gameId, name, colour });
      await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "freeText", fields }, lockedAt });
    };
    await answer("Röda", "red", ["Abba", "Waterlo"]);
    await answer("Blå", "blue", ["Abbba", "waterlo."]);
    await answer("Gröna", "green", ["Abbba", "Mamma mia"], null);
    return { gameId, questionId };
  });
  return { t, ...ids };
}

export const reviewIn = ({ t, gameId, questionId }: Awaited<ReturnType<typeof setup>>) =>
  t.query(api.verdicts.queries.getReview, { ...host, gameId, questionId });

export const scoresOf = async (t: ReturnType<typeof setupConvexTest>, gameId: Id<"games">) =>
  (await t.query(api.scores.queries.getScores, { gameId })).map(({ name, points }) => `${name} ${points}`);

// A running game on a closed list question, with a key of one city, whose two teams sent
// "Gothenburg, Lund" and "Lunds stad".
export async function setupList() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Geografi", kind: "questions" });
    const content = { type: "list" as const, acceptedItems: [{ spellings: ["Göteborg"] }], pointsPerItem: 1, fuzzy: true, aiAssist: false };
    const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Nämn svenska städer", timeLimitSeconds: 60, media: null, hostNotes: "", content });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "answer", questionId }, screenIndex: 4, closedQuestionIds: [questionId] });
    const answer = async (name: string, colour: "red" | "blue", items: string[]) => {
      const teamId = await ctx.db.insert("teams", { gameId, name, colour });
      await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "list", items }, lockedAt: 1 });
    };
    await answer("Röda", "red", ["Gothenburg", "Lund"]);
    await answer("Blå", "blue", ["Lunds stad"]);
    return { gameId, questionId };
  });
  return { t, ...ids };
}
