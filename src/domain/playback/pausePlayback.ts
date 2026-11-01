import type { Playback } from "@convex/games/playback";
import { playbackPositionMs } from "./playbackPositionMs";

export function pausePlayback(playback: Playback, now: number): Playback {
  if (playback.kind === "paused") return playback;
  return { kind: "paused", positionMs: playbackPositionMs(playback, now) };
}
