import type { Playback } from "@convex/games/playback";

// How far into the clip it is now. It may pass the clip's end, where the clip simply stays.
export function playbackPositionMs(playback: Playback, now: number): number {
  return playback.kind === "playing" ? Math.max(now - playback.startedAt, 0) : playback.positionMs;
}
