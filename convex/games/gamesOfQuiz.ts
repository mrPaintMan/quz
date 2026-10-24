import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// A quiz is played a few times at most: a dry run and the night itself.
const MAX_GAMES_PER_QUIZ = 50;

export async function gamesOfQuiz(ctx: QueryCtx, quizId: Id<"quizzes">): Promise<Doc<"games">[]> {
  return ctx.db
    .query("games")
    .withIndex("by_quizId", (q) => q.eq("quizId", quizId))
    .take(MAX_GAMES_PER_QUIZ);
}
