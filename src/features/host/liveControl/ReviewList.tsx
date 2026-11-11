"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Target } from "@/domain/review/typedReview";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { VerdictChoices } from "./VerdictChoices";

export type Review = NonNullable<FunctionReturnType<typeof api.verdicts.queries.getReview>>;
type Slot = Review["slots"][number];

// A slot's heading: a sub-question's title, with its correct answer to compare with (D56).
const slotHeading = (slot: Slot) => (slot.options.length === 1 ? `${slot.title} · facit: ${slot.options[0]}` : slot.title);

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

// Once a typed question's answers lock, on its question and answer screens (D55): every text the
// teams sent, once for every team that wrote it, in three sections (D56). "Att granska" holds those
// no one has judged yet, at the top as they need the hosts; "Bedömda" those the AI judge (marked
// AI) or the hosts judged, to change if needed; "Stämde med facit" those an accepted spelling
// matched, read-only, as an exact match always counts (D51). With the AI judge on, Nästa waits
// until every text is judged; otherwise unjudged texts score nothing.
export function ReviewList({ gameId, questionId, review }: { gameId: Id<"games">; questionId: Id<"questions">; review: Review }) {
  const judge = useHostMutation(api.verdicts.mutations.judgeText);
  const run = useRunAction();
  const left = review.unjudged;
  const judgeable = (item: Review["items"][number], slot: Slot) => (
    <>
      <span className="min-w-32 flex-1 font-medium break-words">
        {item.written}
        {item.byAi && (
          <span title="Bedömt av AI" className="ml-2 rounded bg-secondary px-1.5 py-0.5 align-middle text-xs font-normal text-muted-foreground">
            AI
          </span>
        )}
      </span>
      <span className="text-sm text-muted-foreground">{item.teamCount} lag</span>
      <VerdictChoices slot={slot} item={item} onChoose={(target: Target) => run(() => judge({ gameId, questionId, slot: item.slot, text: item.text, target }))} />
    </>
  );

  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">Granska svar</h3>
        {review.items.length > 0 && <span className="text-sm text-muted-foreground">{left === 0 ? "Allt granskat" : `${left} kvar`}</span>}
      </div>
      {review.aiStatus === "judging" && <p className="text-sm text-primary">AI:n bedömer svaren…</p>}
      {review.aiStatus === "failed" && left > 0 && <p className="text-sm text-destructive">AI:n kunde inte bedöma svaren. Granska dem själva.</p>}
      {review.items.length === 0 && review.exact.length === 0 && <p className="text-sm text-muted-foreground">Inga svar ännu.</p>}
      {review.items.length > 0 && (
        <p className="text-sm text-muted-foreground">Ogranskade svar ger 0 p.{review.aiStatus === "done" && " AI:ns bedömningar är märkta AI; ändra dem om ni inte håller med."}</p>
      )}
      <ReviewSection title="Att granska" slots={review.slots} items={review.items.filter((item) => !item.isJudged)} row={judgeable} />
      <ReviewSection title="Bedömda" slots={review.slots} items={review.items.filter((item) => item.isJudged)} row={judgeable} />
      <ReviewSection
        title="Stämde med facit"
        slots={review.slots}
        items={review.exact}
        row={(item) => (
          <>
            <span className="min-w-32 flex-1 break-words text-muted-foreground">{item.written}</span>
            <span className="text-sm text-muted-foreground">{item.teamCount} lag</span>
            <span className="text-sm text-muted-foreground">= {item.answer}</span>
          </>
        )}
      />
    </section>
  );
}
