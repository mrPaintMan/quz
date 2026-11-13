// Shared by the points-by-hand tests. The extra dot in the file name keeps Convex from deploying it.
import { setupConvexTest } from "../test.setup";

// A running game on an activity worth at most 5, with two teams.
export async function atActivity() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Aktiviteter", kind: "questions" });
    const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Baka ett pepparkakshus", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "activity", maxPoints: 5 } });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
    const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
    const blue = await ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" });
    return { quizId, roundId, questionId, gameId, red, blue };
  });
  return { t, ...ids };
}

export const redDrawing = { type: "drawing" as const, strokes: [{ colour: "red" as const, points: [0.1, 0.2, 0.3, 0.4] }] };

// A running game on a drawing's answer screen, worth at most 3: the red team sent a drawing, the
// blue team didn't.
export async function atDrawing() {
  const setup = await atActivity();
  const { t, quizId, roundId, gameId, red } = setup;
  const drawingId = await t.run(async (ctx) => {
    const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 1, prompt: "Rita en tomte", timeLimitSeconds: 60, media: null, hostNotes: "", content: { type: "drawing", maxPoints: 3 } });
    await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: redDrawing, lockedAt: 1 });
    await ctx.db.patch("games", gameId, { screen: { kind: "answer", questionId }, screenIndex: 5, closedQuestionIds: [questionId], lockedQuestionIds: [questionId] });
    return questionId;
  });
  return { ...setup, drawingId };
}
