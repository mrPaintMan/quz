import { isSamePlayback } from "@/domain/playback/isSamePlayback";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { Playback } from "./playback";
import { requireRunningGame } from "./requireRunningGame";

// Changes the playback the host saw, and does nothing if it has changed since, as changeTimer.
type PlaybackChange = (playback: Playback, now: number) => Playback;

export async function changePlayback(ctx: MutationCtx, gameId: Id<"games">, from: Playback, change: PlaybackChange) {
  const game = await requireRunningGame(ctx, gameId);
  if (game.playback === undefined || !isSamePlayback(game.playback, from)) return;
  await ctx.db.patch("games", gameId, { playback: change(game.playback, Date.now()) });
}
