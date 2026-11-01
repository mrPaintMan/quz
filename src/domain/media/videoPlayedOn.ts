import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionMedia, VideoMedia } from "@convex/questions/table";
import type { Film } from "@convex/rounds/table";
import { filmsOf } from "@/domain/rounds/filmOf";
import { findQuestionInRounds } from "@/domain/rounds/findQuestionInRounds";

type RoundWithVideos = { _id: Id<"rounds">; films?: Film[]; questions: { _id: Id<"questions">; media: QuestionMedia | null }[] };

// The video a screen plays: its question's video, or a På spåret film before its questions (D33).
export function videoPlayedOn(screen: Screen, rounds: RoundWithVideos[]): VideoMedia | null {
  if (screen.kind === "question") {
    const media = findQuestionInRounds(rounds, screen.questionId)?.media;
    return media?.kind === "video" ? media : null;
  }
  if (screen.kind === "film") {
    const round = rounds.find((candidate) => candidate._id === screen.roundId);
    return (round && filmsOf(round).find((film) => film.id === screen.filmId)?.video) ?? null;
  }
  return null;
}
