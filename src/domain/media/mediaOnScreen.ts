import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionMedia } from "@convex/questions/table";
import { findQuestionInRounds } from "@/domain/rounds/findQuestionInRounds";

// The media a screen shows, by its stored files. A clip plays only on its question's screen; the
// answer screen shows the picture again, and a video's still, so the answer can refer to it.
export type ScreenMedia =
  | { kind: "image"; storageId: Id<"_storage"> }
  | { kind: "audio"; storageId: Id<"_storage"> }
  | { kind: "video"; questionId: Id<"questions">; posterId: Id<"_storage"> | null };

type RoundWithMedia = { questions: { _id: Id<"questions">; media: QuestionMedia | null }[] };

// A video is named by its question: the TV asks for the film only while that question shows.
function onQuestion(questionId: Id<"questions">, media: QuestionMedia): ScreenMedia {
  return media.kind === "video" ? { kind: "video", questionId, posterId: media.posterId } : media;
}

function onAnswer(media: QuestionMedia): ScreenMedia | null {
  if (media.kind === "image") return media;
  if (media.kind === "video" && media.posterId !== null) return { kind: "image", storageId: media.posterId };
  return null;
}

export function mediaOnScreen(screen: Screen, rounds: RoundWithMedia[]): ScreenMedia | null {
  if (screen.kind !== "question" && screen.kind !== "answer") return null;
  const media = findQuestionInRounds(rounds, screen.questionId)?.media ?? null;
  if (media === null) return null;
  return screen.kind === "question" ? onQuestion(screen.questionId, media) : onAnswer(media);
}
