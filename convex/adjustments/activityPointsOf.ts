import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// An activity's points in a game, at most one per team (D61).
export function activityPointsOf(ctx: QueryCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  return ctx.db
    .query("adjustments")
    .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", gameId).eq("questionId", questionId))
    .take(TEAM_COLOURS.length);
}
