import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Every team has its own colour, so a game never has more teams than there are colours.
export async function teamsOfGame(ctx: QueryCtx, gameId: Id<"games">): Promise<Doc<"teams">[]> {
  return ctx.db
    .query("teams")
    .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
    .take(TEAM_COLOURS.length);
}
