import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import type { QuestionMedia } from "@convex/questions/table";
import { findQuestionInRounds } from "@/domain/rounds/findQuestionInRounds";
import { isTrip } from "./isTrip";

type RoundWithQuestions = { questions: { _id: Id<"questions">; media: QuestionMedia | null; content: QuestionContent }[] };

export type TripOnScreen = { clues: string[]; durationSeconds: number | null };

// The trip's clues and its film's length while the trip shows, for the hosts; null otherwise.
export function tripOnScreen(screen: Screen, rounds: RoundWithQuestions[]): TripOnScreen | null {
  if (screen.kind !== "question") return null;
  const question = findQuestionInRounds(rounds, screen.questionId);
  if (!question || !isTrip(question.content)) return null;
  const durationSeconds = question.media?.kind === "video" ? question.media.durationSeconds : null;
  return { clues: question.content.clues, durationSeconds };
}
