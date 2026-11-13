import type { FilmOnScreen } from "@/features/player/answering/AnswerInputProps";
import type { RunningGame } from "@/features/shared/game/RunningGame";

// The trip's film while it shows, where it is and how long it is, for the phone's live points (D63);
// null for any other screen.
export function findTripFilm(game: Pick<RunningGame, "media" | "playback">): FilmOnScreen | null {
  return game.media?.kind === "video" && game.media.showsCluePoints ? { playback: game.playback, durationSeconds: game.media.durationSeconds } : null;
}
