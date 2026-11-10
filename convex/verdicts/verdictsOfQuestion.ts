import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Up to 12 teams writing some 20 texts each, with room to spare; the bound every read of a
// question's verdicts uses.
export const MAX_VERDICTS_PER_QUESTION = 500;

// The hosts' verdicts on a question's typed texts in a game, for grading and their review list.
export async function verdictsOfQuestion(ctx: QueryCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  const verdicts = await ctx.db
    .query("verdicts")
    .withIndex("by_gameId_and_questionId_and_slot_and_text", (q) => q.eq("gameId", gameId).eq("questionId", questionId))
    .take(MAX_VERDICTS_PER_QUESTION);
  return verdicts.map(({ slot, text, target, byAi }) => ({ slot, text, target, byAi: byAi ?? false }));
}
