"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Target } from "@/domain/review/typedReview";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { AllAnswers } from "./AllAnswers";
import { VerdictChoices } from "./VerdictChoices";

export type Review = NonNullable<FunctionReturnType<typeof api.verdicts.queries.getReview>>;
type Slot = Review["slots"][number];

// A slot's heading: a sub-question's title, with its correct answer to compare with (D56).
const slotHeading = (slot: Slot) => (slot.answer ? `${slot.title} · facit: ${slot.answer}` : slot.title);

// One of the box's sections, its rows grouped under their sub-question.
function ReviewSection<Item extends { slot: number; text: string }>({
  title,
  slots,
  items,
  row,
}: {
  title: string;
  slots: Slot[];
  items: Item[];
  row: (item: Item, slot: Slot) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h4 className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
      {slots.map((slot, slotIndex) => {
        const inSlot = items.filter((item) => item.slot === slotIndex);
        if (inSlot.length === 0) return null;
        return (
          <div key={slotIndex} className="flex flex-col">
            {slot.title !== "" && <h5 className="mt-1 text-sm font-medium text-muted-foreground">{slotHeading(slot)}</h5>}
            <ul className="flex flex-col">
              {inSlot.map((item) => (
                <li key={item.text} className="flex flex-wrap items-center gap-2 border-t py-2 first:border-t-0">
                  {row(item, slot)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// Once a typed question's answers lock, on its question and answer screens (D55): the texts no one
// has judged yet, once for every team that wrote it, grouped under their sub-question, as these are
// what needs the hosts (D65). Everything else, each team's answers with every verdict to change,
// the AI's and exact matches' included, is behind "Visa alla svar". With the AI judge on, Nästa
// waits until every text is judged; otherwise unjudged texts score nothing.
export function ReviewList({
  gameId,
  questionId,
  review,
  prompt,
  leaderboard,
}: {
  gameId: Id<"games">;
  questionId: Id<"questions">;
  review: Review;
  prompt: string;
  leaderboard: string[];
}) {
  const judge = useHostMutation(api.verdicts.mutations.judgeText);
  const run = useRunAction();
  const left = review.unjudged;
  const hasAnswers = review.items.length > 0 || review.exact.length > 0;

  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">Granska svar</h3>
        {hasAnswers && <span className={`text-sm ${left > 0 ? "text-primary" : "text-muted-foreground"}`}>{left === 0 ? "Allt granskat" : `${left} kvar`}</span>}
      </div>
      {review.aiStatus === "judging" && <p className="text-sm text-primary">AI:n bedömer svaren…</p>}
      {review.aiStatus === "failed" && left > 0 && <p className="text-sm text-destructive">AI:n kunde inte bedöma svaren. Granska dem själva.</p>}
      {!hasAnswers && <p className="text-sm text-muted-foreground">Inga svar ännu.</p>}
      <ReviewSection
        title="Att granska"
        slots={review.slots}
        items={review.items.filter((item) => !item.isJudged)}
        row={(item, slot) => (
          <>
            <span className="min-w-32 flex-1 font-medium break-words">{item.written}</span>
            <span className="text-sm text-muted-foreground">{item.teamCount} lag</span>
            <VerdictChoices slot={slot} item={item} onChoose={(target: Target) => run(() => judge({ gameId, questionId, slot: item.slot, text: item.text, target }))} />
          </>
        )}
      />
      {hasAnswers && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{left > 0 ? "Ogranskade svar ger 0 p." : "Ändra en bedömning under alla svar."}</p>
          <AllAnswers gameId={gameId} questionId={questionId} prompt={prompt} unjudged={left} leaderboard={leaderboard} />
        </div>
      )}
    </section>
  );
}
