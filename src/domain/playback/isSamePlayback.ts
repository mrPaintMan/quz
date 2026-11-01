import type { Playback } from "@convex/games/playback";

// Playbacks are equal when they would play the clip from the same spot.
export function isSamePlayback(a: Playback, b: Playback): boolean {
  if (a.kind === "playing" && b.kind === "playing") return a.startedAt === b.startedAt;
  if (a.kind === "paused" && b.kind === "paused") return a.positionMs === b.positionMs;
  return false;
}
