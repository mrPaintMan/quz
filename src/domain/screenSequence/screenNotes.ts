import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import { describeNumberScoring } from "@/domain/questionTypes/number/describeNumberScoring";

type NotedRound = { questions: { _id: Id<"questions">; hostNotes: string; content: QuestionContent }[] }[];

// For the hosts during the night: the notes ("manus") of the question a screen shows, its question
// or its answer screen, and for Gissa siffran how it scores, to read out (D54). null for screens
// without a question, past the last screen, or for a question that is gone.
export function screenNotes(screen: Screen | undefined, rounds: NotedRound) {
  if (screen?.kind !== "question" && screen?.kind !== "answer") return null;
  const question = rounds.flatMap((round) => round.questions).find((candidate) => candidate._id === screen.questionId);
  if (!question) return null;
  return {
    questionId: question._id,
    notes: question.hostNotes.trim(),
    scoring: question.content.type === "number" ? describeNumberScoring(question.content) : null,
  };
}
