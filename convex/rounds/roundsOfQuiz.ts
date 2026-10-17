import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export const MAX_ROUNDS_PER_QUIZ = 50;

export async function roundsOfQuiz(ctx: QueryCtx, quizId: Id<"quizzes">): Promise<Doc<"rounds">[]> {
  return ctx.db
    .query("rounds")
    .withIndex("by_quizId_and_position", (q) => q.eq("quizId", quizId))
    .take(MAX_ROUNDS_PER_QUIZ);
}
