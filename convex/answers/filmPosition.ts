import type { FilmPosition } from "@/domain/answering/answeringRules";
import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";
import type { Doc } from "../_generated/dataModel";

// Where the question's film is now, from the playback stored on the game (D39) and the film's
// stored length; at the start, and 0 long, without a film or before it plays.
export function filmPosition(game: Doc<"games">, question: Doc<"questions">, now: number): FilmPosition {
  const durationSeconds = question.media?.kind === "video" ? (question.media.durationSeconds ?? 0) : 0;
  const positionSeconds = game.playback ? playbackPositionMs(game.playback, now) / 1000 : 0;
  return { positionSeconds, durationSeconds };
}
