import { ConvexError, v } from "convex/values";
import { findUnfinishedQuestions } from "@/domain/questions/findUnfinishedQuestions";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { questionsOfRound } from "../questions/questionsOfRound";
import { roundsOfQuiz } from "../rounds/roundsOfQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";

async function requireReadyQuiz(ctx: QueryCtx, quizId: Id<"quizzes">) {
  const rounds = await roundsOfQuiz(ctx, quizId);
  const roundsWithQuestions = await Promise.all(
    rounds.map(async (round) => ({ ...round, questions: await questionsOfRound(ctx, round._id) })),
  );
  if (roundsWithQuestions.every((round) => round.questions.length === 0)) {
    throw new ConvexError("Lägg till minst en fråga innan quizet startar.");
  }
  const unfinished = findUnfinishedQuestions(roundsWithQuestions).length;
  if (unfinished > 0) {
    throw new ConvexError(`${unfinished === 1 ? "1 fråga behöver" : `${unfinished} frågor behöver`} fyllas i innan quizet startar.`);
  }
}

// Only one game runs at a time (phones join it at quz.nu), so starting one ends the running game.
export const startGame = hostMutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, { quizId }) => {
    await getOrThrow(ctx, "quizzes", quizId);
    await requireReadyQuiz(ctx, quizId);
    const running = await findRunningGame(ctx);
    if (running !== null) {
      await ctx.db.patch("games", running._id, { endedAt: Date.now() });
    }
    return ctx.db.insert("games", { quizId, endedAt: null });
  },
});

export const endGame = hostMutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await getOrThrow(ctx, "games", gameId);
    if (game.endedAt === null) {
      await ctx.db.patch("games", gameId, { endedAt: Date.now() });
    }
  },
});
