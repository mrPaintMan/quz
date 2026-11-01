import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";

// For the hosts' live controls, which only work while the game runs.
export async function requireRunningGame(ctx: QueryCtx, gameId: Id<"games">) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  return game;
}
