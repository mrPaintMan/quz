import { describeNumberScoring } from "@/domain/questionTypes/number/describeNumberScoring";
import type { Doc } from "../_generated/dataModel";
import type { Screen } from "./screen";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

// For the hosts during the night: the notes ("manus") of the question a screen shows, its question
// or its answer screen, and for Gissa siffran how it scores, to read out. null for screens without
// a question.
export function screenNotes(screen: Screen | undefined, rounds: RoundWithQuestions[]) {
  if (screen?.kind !== "question" && screen?.kind !== "answer") return null;
  const question = rounds.flatMap((round) => round.questions).find((candidate) => candidate._id === screen.questionId);
  if (!question) return null;
  return {
    questionId: question._id,
    notes: question.hostNotes.trim(),
    scoring: question.content.type === "number" ? describeNumberScoring(question.content) : null,
  };
}
