import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export const MAX_QUESTIONS_PER_ROUND = 100;

// Every round, a På spåret round with its films included (D70), stops here, so a round is always
// read whole.
export function requireRoomForQuestion(questions: Doc<"questions">[]): void {
  if (questions.length >= MAX_QUESTIONS_PER_ROUND) {
    throw new ConvexError(`En omgång kan ha högst ${MAX_QUESTIONS_PER_ROUND} frågor.`);
  }
}

export async function questionsOfRound(ctx: QueryCtx, roundId: Id<"rounds">): Promise<Doc<"questions">[]> {
  return ctx.db
    .query("questions")
    .withIndex("by_roundId_and_position", (q) => q.eq("roundId", roundId))
    .take(MAX_QUESTIONS_PER_ROUND);
}
