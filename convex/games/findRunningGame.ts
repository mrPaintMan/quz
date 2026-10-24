import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// startGame ends the running game before inserting a new one, so there is at most one.
export async function findRunningGame(ctx: QueryCtx): Promise<Doc<"games"> | null> {
  return ctx.db
    .query("games")
    .withIndex("by_endedAt", (q) => q.eq("endedAt", null))
    .first();
}
