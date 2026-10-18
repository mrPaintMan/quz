import { Button } from "@/components/ui/button";
import { findQuestionProblems } from "@/domain/questions/findQuestionProblems";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";

function summarize(rounds: RoundWithQuestions[]): string {
  const questions = rounds.flatMap((round) => round.questions);
  if (questions.length === 0) return "Inga frågor ännu";
  const unfinished = questions.filter((question) => findQuestionProblems(question).length > 0).length;
  if (unfinished === 0) return `Alla ${questions.length} frågor är klara`;
  return unfinished === 1 ? "1 fråga behöver fyllas i" : `${unfinished} frågor behöver fyllas i`;
}

// "Starta quiz" opens the live game, which is built in M2; until then it only shows readiness.
export function ReadinessSummary({ rounds }: { rounds: RoundWithQuestions[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground" role="status">
        {summarize(rounds)}
      </span>
      <Button disabled aria-describedby="start-quiz-hint">
        Starta quiz
      </Button>
      <span id="start-quiz-hint" className="text-xs text-muted-foreground">
        Spelläget kommer i nästa steg
      </span>
    </div>
  );
}
