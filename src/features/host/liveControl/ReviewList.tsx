"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";

// On a typed question's answer screen: each text no accepted spelling matched, once for every
// team that wrote it, for the hosts to judge right (as which answer, when there are several) or
// wrong (D51). The AI judge fills in what it is sure of, marked AI, and the hosts can change it
// (D52). Unjudged texts score nothing, so the night never waits on the list.
export function ReviewList({ gameId, questionId }: { gameId: Id<"games">; questionId: Id<"questions"> }) {
  const review = useHostQuery(api.verdicts.queries.getReview, { gameId, questionId });
  const judge = useHostMutation(api.verdicts.mutations.judgeText);
  const run = useRunAction();
  if (!review) return null;
  const left = review.items.filter((item) => !item.isJudged).length;

  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">Granska svar</h3>
        {review.items.length > 0 && <span className="text-sm text-muted-foreground">{left === 0 ? "Allt granskat" : `${left} kvar`}</span>}
      </div>
      {review.aiStatus === "judging" && <p className="text-sm text-primary">AI:n bedömer svaren…</p>}
      {review.aiStatus === "failed" && left > 0 && <p className="text-sm text-destructive">AI:n kunde inte bedöma svaren. Granska dem själva.</p>}
      {review.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inga svar att granska.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Ogranskade svar ger 0 p.{review.aiStatus === "done" && " AI:ns bedömningar är märkta AI; ändra dem om ni inte håller med."}</p>
      )}
      {review.slots.map((slot, slotIndex) => {
        const items = review.items.filter((item) => item.slot === slotIndex);
        if (items.length === 0) return null;
        return (
          <div key={slotIndex} className="flex flex-col">
            {slot.title !== "" && <h4 className="mt-1 text-sm font-medium text-muted-foreground">{slot.title}</h4>}
            <ul className="flex flex-col">
              {items.map((item) => {
                const choose = (target: number | null) => run(() => judge({ gameId, questionId, slot: item.slot, text: item.text, target }));
                const isChosen = (target: number | null) => item.isJudged && item.target === target;
                return (
                  <li key={item.text} className="flex flex-wrap items-center gap-2 border-t py-2 first:border-t-0">
                    <span className="min-w-32 flex-1 font-medium break-words">
                      {item.written}
                      {item.byAi && (
                        <span title="Bedömt av AI" className="ml-2 rounded bg-secondary px-1.5 py-0.5 align-middle text-xs font-normal text-muted-foreground">
                          AI
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.teamCount} lag</span>
                    <div className="flex flex-wrap gap-1.5">
                      {slot.options.map((label, target) => (
                        <Button key={target} size="sm" variant={isChosen(target) ? "default" : "outline"} aria-pressed={isChosen(target)} onClick={() => choose(target)}>
                          {slot.options.length === 1 ? "Rätt" : label}
                        </Button>
                      ))}
                      <Button size="sm" variant={isChosen(null) ? "default" : "outline"} aria-pressed={isChosen(null)} onClick={() => choose(null)}>
                        Fel
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
