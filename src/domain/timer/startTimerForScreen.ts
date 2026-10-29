import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { Timer } from "@convex/games/timer";
import { startTimer } from "./startTimer";

type RoundWithTimedQuestions = { questions: { _id: Id<"questions">; timeLimitSeconds: number | null }[] };

// A fresh timer when the screen is a question with a time limit; none on every other screen.
// The screen is one of the sequence built from the same rounds, so its question is there.
export function startTimerForScreen(screen: Screen, rounds: RoundWithTimedQuestions[], now: number): Timer | undefined {
  if (screen.kind !== "question") return undefined;
  const question = rounds.flatMap((round) => round.questions).find((candidate) => candidate._id === screen.questionId);
  return startTimer(question?.timeLimitSeconds ?? null, now);
}
