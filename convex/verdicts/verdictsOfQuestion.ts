import { MAX_TYPED_TEXTS } from "@/domain/answering/registry";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Every text the teams can send to a question judged once: 12 teams with 100 typed texts each (a
// full list); the bound every read of a question's verdicts uses.
export const MAX_VERDICTS_PER_QUESTION = TEAM_COLOURS.length * MAX_TYPED_TEXTS;

// The hosts' verdicts on a question's typed texts in a game, for grading and their review list.
export async function verdictsOfQuestion(ctx: QueryCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  const verdicts = await ctx.db
    .query("verdicts")
    .withIndex("by_gameId_and_questionId_and_slot_and_text", (q) => q.eq("gameId", gameId).eq("questionId", questionId))
    .take(MAX_VERDICTS_PER_QUESTION);
  return verdicts.map(({ slot, text, target, byAi }) => ({ slot, text, target, byAi: byAi ?? false }));
}
