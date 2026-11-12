// Shared by the manual points tests. The extra dot in the file name keeps Convex from deploying it.
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
