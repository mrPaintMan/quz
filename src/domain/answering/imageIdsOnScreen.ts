import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import { findQuestionInRounds } from "@/domain/rounds/findQuestionInRounds";
import { answeringOf } from "./registry";

type RoundWithQuestions = { questions: { _id: Id<"questions">; content: QuestionContent }[] };

// The pictures a question or answer screen shows as part of the question, such as image options.
export function imageIdsOnScreen(screen: Screen, rounds: RoundWithQuestions[]): Id<"_storage">[] {
  if (screen.kind !== "question" && screen.kind !== "answer") return [];
  const content = findQuestionInRounds(rounds, screen.questionId)?.content;
  return (content && answeringOf(content)?.imageIds(content)) ?? [];
}
