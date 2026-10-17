import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

// Marks the quiz as edited now; drives "Sparat för … sedan" and the quiz list order.
export async function touchQuiz(ctx: MutationCtx, quizId: Id<"quizzes">): Promise<void> {
  await ctx.db.patch("quizzes", quizId, { updatedAt: Date.now() });
}
