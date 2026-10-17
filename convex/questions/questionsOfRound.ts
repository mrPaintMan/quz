import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export const MAX_QUESTIONS_PER_ROUND = 100;

export async function questionsOfRound(ctx: QueryCtx, roundId: Id<"rounds">): Promise<Doc<"questions">[]> {
  return ctx.db
    .query("questions")
    .withIndex("by_roundId_and_position", (q) => q.eq("roundId", roundId))
    .take(MAX_QUESTIONS_PER_ROUND);
}
