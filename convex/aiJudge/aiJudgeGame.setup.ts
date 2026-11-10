// Shared by the AI judge tests. The extra dot in the file name keeps Convex from deploying it.
import type { ContentOf, QuestionContent } from "../questions/questionContent";
import { setupConvexTest } from "../test.setup";

export const freeText: ContentOf<"freeText"> = {
  type: "freeText",
  fields: [{ label: "", acceptedAnswers: ["Saffran"] }],
  pointsPerField: 1,
  fuzzy: true,
};

// A running game on the question's answer screen, with the question closed and two teams'
// sent answers ("Safran", "Kanel") and a draft ("Safrann").
export async function setupJudging(content: QuestionContent = freeText) {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
    const question = { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "" };
    const questionId = await ctx.db.insert("questions", { ...question, content });
    const gameId = await ctx.db.insert("games", {
      quizId,
      endedAt: null,
      screen: { kind: "answer", questionId },
      screenIndex: 4,
      closedQuestionIds: [questionId],
    });
    const answer = async (name: string, colour: "red" | "blue" | "green", text: string, lockedAt: number | null) => {
      const teamId = await ctx.db.insert("teams", { gameId, name, colour });
      await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "freeText", fields: [text] }, lockedAt });
    };
    await answer("Röda", "red", "Safran", 1);
    await answer("Blå", "blue", "Kanel", 1);
    await answer("Gröna", "green", "Safrann", null);
    return { gameId, questionId };
  });
  return { t, ...ids };
}

// Marks the question as being judged, as closing it does, without queueing the AI judge: convex-test
// would run the queued action on its own.
export async function markJudging({ t, gameId, questionId }: Awaited<ReturnType<typeof setupJudging>>) {
  await t.run((ctx) => ctx.db.insert("aiJudgings", { gameId, questionId, status: "judging" }));
}
