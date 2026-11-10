import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// The answers teams have sent, or had locked, to a question in a game. Drafts sort before every
// lock time (null first), so this range holds only locked answers and a team's typing doesn't
// make it read again (D45).
export function lockedAnswersOfQuestion(ctx: QueryCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  return ctx.db
    .query("answers")
    .withIndex("by_gameId_and_questionId_and_lockedAt", (q) => q.eq("gameId", gameId).eq("questionId", questionId).gt("lockedAt", null))
    .take(TEAM_COLOURS.length);
}
