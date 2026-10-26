"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatSavedAgo } from "@/domain/time/formatSavedAgo";
import { QuestionEditor } from "@/features/host/authoring/editor/question/QuestionEditor";
import { RoundList } from "@/features/host/authoring/editor/rounds/RoundList";
import { RoundPanel } from "@/features/host/authoring/editor/rounds/RoundPanel";
import { HostHeader } from "@/features/host/shared/HostHeader";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { useNow } from "@/features/host/shared/useNow";
import { QuizTitleField } from "./QuizTitleField";
import { ReadinessSummary } from "./ReadinessSummary";
import { resolveSelection } from "./resolveSelection";

// Rounds on the left, the round's questions in the middle, the selected question on the right.
export function QuizEditor({ quizId }: { quizId: Id<"quizzes"> }) {
  const tree = useHostQuery(api.quizzes.queries.getQuizTree, { quizId });
  const now = useNow();
  const [selectedRoundId, setSelectedRoundId] = useState<Id<"rounds"> | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<Id<"questions"> | null>(null);
  const questionColumn = useRef<HTMLElement>(null);

  // On a phone the columns stack, so bring the question editor into view when a question is picked.
  const selectQuestion = (questionId: Id<"questions">) => {
    setSelectedQuestionId(questionId);
    if (window.matchMedia("(max-width: 767px)").matches) {
      questionColumn.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (tree === undefined) {
    return <p className="p-8 text-center text-muted-foreground">Hämtar quizet…</p>;
  }
  if (tree === null) {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p>Quizet finns inte, det kan ha tagits bort.</p>
        <Link href="/admin" className="text-primary hover:underline">
          Till dina quiz
        </Link>
      </div>
    );
  }

  const { round, question } = resolveSelection(tree.rounds, selectedRoundId, selectedQuestionId);
  const selectRound = (roundId: Id<"rounds">) => {
    setSelectedRoundId(roundId);
    setSelectedQuestionId(null);
  };

  return (
    <div className="flex min-h-svh flex-col">
      <HostHeader actions={<ReadinessSummary quizId={tree.quiz._id} rounds={tree.rounds} />}>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Dina quiz
        </Link>
        <QuizTitleField key={tree.quiz._id} quiz={tree.quiz} />
        <span className="text-xs text-muted-foreground">{formatSavedAgo(tree.quiz.updatedAt, now)}</span>
      </HostHeader>
      <div className="flex flex-1 flex-wrap">
        <div className="w-full border-b p-4 md:w-72 md:border-r md:border-b-0">
          <RoundList quizId={quizId} rounds={tree.rounds} selectedRoundId={round?._id ?? null} onSelectRound={selectRound} />
        </div>
        <div className="w-full border-b p-4 md:w-96 md:border-r md:border-b-0">
          {round ? (
            <RoundPanel
              key={round._id}
              round={round}
              selectedQuestionId={question?._id ?? null}
              onSelectQuestion={selectQuestion}
              onDeleted={() => selectRound(tree.rounds[0]._id)}
            />
          ) : (
            <p className="text-muted-foreground">Börja med att lägga till en omgång.</p>
          )}
        </div>
        <main ref={questionColumn} className="min-w-0 flex-1 basis-96 scroll-mt-2 p-4 md:p-6">
          {round && question ? (
            <QuestionEditor
              key={`${question._id}:${question.content.type}`}
              question={question}
              round={round}
              rounds={tree.rounds}
              onDeleted={() => setSelectedQuestionId(null)}
              onMoved={(roundId) => {
                setSelectedRoundId(roundId);
                setSelectedQuestionId(question._id);
              }}
            />
          ) : (
            <p className="text-muted-foreground">Välj eller lägg till en fråga.</p>
          )}
        </main>
      </div>
    </div>
  );
}
