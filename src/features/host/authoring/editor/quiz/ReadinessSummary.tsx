import type { Id } from "@convex/_generated/dataModel";
import { findUnfinishedQuestions } from "@/domain/questions/findUnfinishedQuestions";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";
import { StartGameButton } from "./StartGameButton";

function summarize(questionCount: number, unfinished: number): string {
  if (questionCount === 0) return "Inga frågor ännu";
  if (unfinished === 0) return `Alla ${questionCount} frågor är klara`;
  return unfinished === 1 ? "1 fråga behöver fyllas i" : `${unfinished} frågor behöver fyllas i`;
}

// "Starta quiz" stays disabled until every question is filled in (D20).
export function ReadinessSummary({ quizId, rounds }: { quizId: Id<"quizzes">; rounds: RoundWithQuestions[] }) {
  const questionCount = rounds.reduce((count, round) => count + round.questions.length, 0);
  const unfinished = findUnfinishedQuestions(rounds).length;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground" role="status">
        {summarize(questionCount, unfinished)}
      </span>
      <StartGameButton quizId={quizId} disabled={questionCount === 0 || unfinished > 0} />
    </div>
  );
}
