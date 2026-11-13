import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import type { QuestionMedia } from "@convex/questions/table";
import type { Film } from "@convex/rounds/table";
import { isTrip } from "@/domain/questionTypes/paSparet/isTrip";
import { findQuestionInRounds } from "@/domain/rounds/findQuestionInRounds";
import { videoPlayedOn } from "./videoPlayedOn";

// The media a screen shows, by its stored files. A clip plays only on its own screen; the answer
// screen shows the picture again, and a video's still, so the answer can refer to it. A video is
// named by the screen it plays on: the TV asks for the film only while that screen shows, and
// the trip's film shows the clue points over it. The trip's answer screen shows no still, as the
// destination and every team's guess need the room (D63).
export type ScreenMedia =
  | { kind: "image"; storageId: Id<"_storage"> }
  | { kind: "audio"; storageId: Id<"_storage"> }
  // The film's length lets the phones follow the trip's clues (D63).
  | { kind: "video"; screen: Screen; posterId: Id<"_storage"> | null; durationSeconds: number | null; showsCluePoints: boolean };

type QuestionWithMedia = { _id: Id<"questions">; media: QuestionMedia | null; content: QuestionContent };
type RoundWithMedia = { _id: Id<"rounds">; films?: Film[]; questions: QuestionWithMedia[] };

function onAnswer(media: QuestionMedia): ScreenMedia | null {
  if (media.kind === "image") return media;
  if (media.kind === "video" && media.posterId !== null) return { kind: "image", storageId: media.posterId };
  return null;
}

function onQuestion(screen: Screen, question: QuestionWithMedia, media: QuestionMedia): ScreenMedia {
  if (media.kind !== "video") return media;
  return { kind: "video", screen, posterId: media.posterId, durationSeconds: media.durationSeconds, showsCluePoints: isTrip(question.content) };
}

export function mediaOnScreen(screen: Screen, rounds: RoundWithMedia[]): ScreenMedia | null {
  if (screen.kind === "film") {
    const film = videoPlayedOn(screen, rounds);
    return film && { kind: "video", screen, posterId: film.posterId, durationSeconds: film.durationSeconds, showsCluePoints: false };
  }
  if (screen.kind !== "question" && screen.kind !== "answer") return null;
  const question = findQuestionInRounds(rounds, screen.questionId);
  if (!question?.media) return null;
  if (screen.kind === "question") return onQuestion(screen, question, question.media);
  return isTrip(question.content) ? null : onAnswer(question.media);
}
