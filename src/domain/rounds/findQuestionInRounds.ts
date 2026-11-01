import type { Id } from "@convex/_generated/dataModel";

// The question with this id in any of the rounds, or undefined if it isn't there.
export function findQuestionInRounds<Q extends { _id: Id<"questions"> }>(rounds: { questions: Q[] }[], questionId: Id<"questions">): Q | undefined {
  return rounds.flatMap((round) => round.questions).find((question) => question._id === questionId);
}
