"use client";

import { useQuery } from "convex/react";
import type { ComponentType, ReactNode } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent } from "@convex/answers/answerContent";
import type { Outcome } from "@/domain/answering/outcome";
import type { ShownQuestion } from "@/domain/answering/registry";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { resultViews } from "./registry";

type AnyResultView = ComponentType<{ shown: ShownQuestion; answer: AnswerContent; outcome: Outcome; imageUrls: ImageUrls }>;

// From a question's answer screen until the next question, in place of the phone's usual line
// (D58, D59): the question, the team's own answer drawn like its input with the parts that scored
// lit up, and the total where "Skicka svar" was. Follows verdicts as they come in. Anything else
// shows what the phone shows otherwise.
export function QuestionResult({ teamId, otherwise }: { teamId: Id<"teams">; otherwise: ReactNode }) {
  const result = useQuery(api.answers.queries.getTeamFeedback, { teamId });
  if (!result) return <>{otherwise}</>;
  const { prompt, shown, answer, outcome, imageUrls } = result;
  // TypeScript can't link a type to its entry on its own; the registry's type guarantees they match.
  const View = resultViews[shown.type] as AnyResultView | null;
  const isFinal = outcome !== null && !outcome.parts.some((part) => part.result === "pending");

  return (
    <section aria-label="Ert svar" className="flex flex-1 flex-col gap-4">
      <p className="text-muted-foreground">{prompt}</p>
      {outcome === null && <p className="text-xl">Ni svarade inte.</p>}
      {View && answer && outcome && <View shown={shown} answer={answer} outcome={outcome} imageUrls={imageUrls} />}
      {outcome !== null && (
        <p className="mt-auto border-t border-secondary pt-4 text-center text-lg font-semibold text-primary">
          {isFinal ? `Ni fick ${formatPoints(outcome.points)}` : `Ni har fått ${formatPoints(outcome.points)} än så länge.`}
        </p>
      )}
    </section>
  );
}
