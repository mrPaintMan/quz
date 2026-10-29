import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import type { Timer } from "./timer";

// Applies a change to the timer of the screen showing now; does nothing if it has no timer.
export async function changeTimer(ctx: MutationCtx, gameId: Id<"games">, change: (timer: Timer, now: number) => Timer) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  if (game.timer === undefined) return;
  await ctx.db.patch("games", gameId, { timer: change(game.timer, Date.now()) });
}
