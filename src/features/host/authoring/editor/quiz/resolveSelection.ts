import type { Doc, Id } from "@convex/_generated/dataModel";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

// The selected round and question, falling back to the first ones when nothing is
// selected yet or the selection was deleted (possibly by the other host).
export function resolveSelection(
  rounds: RoundWithQuestions[],
  roundId: Id<"rounds"> | null,
  questionId: Id<"questions"> | null,
): { round: RoundWithQuestions | null; question: Doc<"questions"> | null } {
  const round = rounds.find((candidate) => candidate._id === roundId) ?? rounds[0] ?? null;
  const question = round?.questions.find((candidate) => candidate._id === questionId) ?? round?.questions[0] ?? null;
  return { round, question };
}
