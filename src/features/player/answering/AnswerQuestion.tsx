"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, type ComponentType } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent } from "@convex/answers/answerContent";
import { Button } from "@/components/ui/button";
import { isAnswerComplete, sendsWithBrake, startingAnswerOf, type ShownQuestion } from "@/domain/answering/registry";
import { describeActionError } from "@/features/shared/errors/describeActionError";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { answerInputs } from "./registry";
import type { FilmOnScreen } from "./AnswerInputProps";
import { useDraftSaver } from "./useDraftSaver";

type AnyInput = ComponentType<{
  shown: ShownQuestion;
  answer: AnswerContent | null;
  imageUrls: ImageUrls;
  disabled: boolean;
  onChange: (answer: AnswerContent) => void;
  onSend: (answer: AnswerContent) => void;
  isSending: boolean;
  film: FilmOnScreen | null;
}>;

type AnswerQuestionProps = {
  teamId: Id<"teams">;
  questionId: Id<"questions">;
  shown: ShownQuestion;
  imageUrls: ImageUrls;
  // The whole seconds left on the question's timer, on this phone's clock; null without a timer.
  secondsLeft: number | null;
  // The trip's film while it shows, for its live points; null otherwise (D63).
  film?: FilmOnScreen | null;
  // Whether the question takes answers no more, as every team has sent or the time ran out (D55).
  isQuestionLocked?: boolean;
};

// With this little time left, a change is saved at once, as waiting for the team to pause could
// miss the lock at time out (D45).
const SAVE_AT_ONCE_SECONDS = 2;

// The team answers on its phone and sending locks the answer (D16, D41); meanwhile the latest
// change is kept on the server as a draft, without the team seeing it (D45). Once locked, or once
// the time is out, the answer stays on show but can't change. Remount it for each question, keyed
// by the question, so a draft never carries over.
export function AnswerQuestion({ teamId, questionId, shown, imageUrls, secondsLeft, film = null, isQuestionLocked = false }: AnswerQuestionProps) {
  // Out of time on this phone, or the question locked on the server: nothing more can be sent.
  const isClosedForSending = secondsLeft === 0 || isQuestionLocked;
  const saved = useQuery(api.answers.queries.getTeamAnswer, { teamId, questionId });
  const saveDraft = useMutation(api.answers.mutations.saveAnswerDraft);
  const sendAnswer = useMutation(api.answers.mutations.sendAnswer);
  const [draft, setDraft] = useState<AnswerContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      return true;
    } catch (failure) {
      setError(describeActionError(failure));
      return false;
    }
  };
  // Drafts are a quiet fallback that the answers lock to when the time is out or the hosts move on:
  // saved a second after the team pauses, and a save that fails shows nothing (D45).
  const drafts = useDraftSaver((content) => {
    saveDraft({ teamId, questionId, content }).catch(() => undefined);
  });
  // The registry pairs each type with its own input; TypeScript can't follow the lookup.
  const Input = answerInputs[shown.type] as unknown as AnyInput | null;

  if (saved === undefined || Input === null) return null;
  // A trip's guess is sent by the emergency brake in its own input, which shows its own states (D63).
  const sendsItself = sendsWithBrake(shown.type);
  const isLocked = saved?.isLocked ?? false;
  // Locked on the server with nothing saved, the team has no answer, whatever this phone still holds;
  // out of time on this phone only, a draft just changed may still be saved within the grace (D41).
  const hasNoAnswer = saved === null && (isQuestionLocked || (secondsLeft === 0 && draft === null));
  // A locked answer is the one on the server; until then the latest change on this phone, or the
  // answer the question starts from, such as a sort question's shuffled order. With no answer, the
  // input shows nothing, so a change that never reached the server doesn't look kept.
  const answer = hasNoAnswer ? null : saved?.isLocked ? saved.content : (draft ?? saved?.content ?? startingAnswerOf(shown));
  // A draft still waiting is dropped only once the answer is sent; if sending fails, it stays the
  // fallback.
  const send = async (content: AnswerContent) => {
    setIsSending(true);
    if (await run(() => sendAnswer({ teamId, questionId, content }))) drafts.cancel();
    setIsSending(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Input
        shown={shown}
        answer={answer}
        imageUrls={imageUrls}
        disabled={isLocked || isClosedForSending}
        onChange={(next) => {
          setDraft(next);
          if (secondsLeft !== null && secondsLeft <= SAVE_AT_ONCE_SECONDS) drafts.saveNow(next);
          else drafts.schedule(next);
        }}
        onSend={(content) => void send(content)}
        isSending={isSending}
        film={film}
      />
      <div className="mt-auto flex flex-col gap-2.5">
        {isLocked ? (
          !sendsItself && (
            <p aria-live="polite" className="text-center text-lg font-semibold">
              Svar skickat ✓
            </p>
          )
        ) : hasNoAnswer ? (
          <p aria-live="polite" className="text-center text-lg font-semibold">
            Inget svar sparades.
          </p>
        ) : (
          !sendsItself && (
          <>
            <p className="text-sm text-muted-foreground">Svaret låses när ni skickar det.</p>
            <Button
              size="lg"
              className="min-h-14 text-lg"
              disabled={isClosedForSending || isSending || answer === null || !isAnswerComplete(shown, answer)}
              onClick={() => answer && send(answer)}
            >
              Skicka svar
            </Button>
          </>
          )
        )}
        {error && !isLocked && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
