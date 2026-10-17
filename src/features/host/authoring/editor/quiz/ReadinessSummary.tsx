import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { findQuestionProblems } from "@/domain/questions/findQuestionProblems";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

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
      <Button disabled title="Spelläget byggs i nästa steg">
        Starta quiz
      </Button>
    </div>
  );
}
