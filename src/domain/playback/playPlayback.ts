import type { Playback } from "@convex/games/playback";

// Plays on from the spot it was paused at.
export function playPlayback(playback: Playback, now: number): Playback {
  if (playback.kind === "playing") return playback;
  return { kind: "playing", startedAt: now - playback.positionMs };
}
