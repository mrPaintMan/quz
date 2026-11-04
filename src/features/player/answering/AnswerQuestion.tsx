"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, type ComponentType } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent } from "@convex/answers/answerContent";
import { Button } from "@/components/ui/button";
import { isAnswerComplete, type ShownQuestion } from "@/domain/answering/registry";
import { describeActionError } from "@/features/shared/errors/describeActionError";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { answerInputs } from "./registry";

type AnyInput = ComponentType<{
  shown: ShownQuestion;
  answer: AnswerContent | null;
  imageUrls: ImageUrls;
  disabled: boolean;
  onChange: (answer: AnswerContent) => void;
}>;

type AnswerQuestionProps = { teamId: Id<"teams">; questionId: Id<"questions">; shown: ShownQuestion; imageUrls: ImageUrls; isTimeOut: boolean };

// The team answers on its phone: each change is saved as a draft, so nothing is lost if the phone
// sleeps, and sending locks the answer (D16, D41). Once locked, or once the time is out, the
// answer stays on show but can't change. Remount it for each question.
export function AnswerQuestion({ teamId, questionId, shown, imageUrls, isTimeOut }: AnswerQuestionProps) {
  const saved = useQuery(api.answers.queries.getTeamAnswer, { teamId, questionId });
  const saveDraft = useMutation(api.answers.mutations.saveAnswerDraft);
  const sendAnswer = useMutation(api.answers.mutations.sendAnswer);
  const [draft, setDraft] = useState<AnswerContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The registry pairs each type with its own input; TypeScript can't follow the lookup.
  const Input = answerInputs[shown.type] as unknown as AnyInput | null;

  if (saved === undefined || Input === null) return null;
  const isLocked = saved?.isLocked ?? false;
  // A locked answer is the one on the server; until then the latest change on this phone.
  const answer = saved?.isLocked ? saved.content : (draft ?? saved?.content ?? null);
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (failure) {
      setError(describeActionError(failure));
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Input
        shown={shown}
        answer={answer}
        imageUrls={imageUrls}
        disabled={isLocked || isTimeOut}
        onChange={(next) => {
          setDraft(next);
          void run(() => saveDraft({ teamId, questionId, content: next }));
        }}
      />
      <div className="mt-auto flex flex-col gap-2.5">
        {isLocked ? (
          <p aria-live="polite" className="text-center text-lg font-semibold">
            Svar skickat ✓
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Svaret låses när ni skickar det.</p>
            <Button
              size="lg"
              className="min-h-14 text-lg"
              disabled={isTimeOut || answer === null || !isAnswerComplete(answer)}
              onClick={() => answer && run(() => sendAnswer({ teamId, questionId, content: answer }))}
            >
              Skicka svar
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
