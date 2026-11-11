"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { OutcomePart } from "@/domain/answering/outcome";
import { formatPoints } from "@/domain/scoring/formatPoints";

// How each result is marked, with words for screen readers.
const MARKS: Record<OutcomePart["result"], { mark: string; name: string; colour: string }> = {
  right: { mark: "✓", name: "Rätt", colour: "bg-primary text-primary-foreground" },
  wrong: { mark: "✗", name: "Fel", colour: "bg-secondary text-muted-foreground" },
  pending: { mark: "…", name: "Bedöms", colour: "bg-secondary text-muted-foreground" },
  repeat: { mark: "=", name: "Räknas redan", colour: "bg-secondary text-muted-foreground" },
};

// After the answer is shown, until the next question: what the team's own answer counted as, part
// by part, and its points, following verdicts as they come in (D58).
export function AnswerFeedback({ teamId }: { teamId: Id<"teams"> }) {
  const feedback = useQuery(api.answers.queries.getTeamFeedback, { teamId });
  if (!feedback) return null;
  const { prompt, outcome } = feedback;

  return (
    <section aria-label="Ert svar" className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-4 text-left">
      <p className="text-sm text-muted-foreground">{prompt}</p>
      {outcome === null ? (
        <p>Ni svarade inte.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {outcome.parts.map((part, index) => {
              const { mark, name, colour } = MARKS[part.result];
              return (
                <li key={index} className="flex items-start gap-3">
                  <span role="img" aria-label={name} className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colour}`}>
                    {mark}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    {part.label !== "" && <span className="text-sm text-muted-foreground">{part.label}</span>}
                    <span className="break-words">{part.given === "" ? "Inget svar" : part.given}</span>
                    {part.result === "wrong" && part.correct !== "" && <span className="text-sm text-muted-foreground">Rätt svar: {part.correct}</span>}
                    {part.result === "pending" && <span className="text-sm text-muted-foreground">Bedöms…</span>}
                    {part.result === "repeat" && <span className="text-sm text-muted-foreground">Räknas redan</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-lg font-semibold text-primary">
            {outcome.parts.some((part) => part.result === "pending")
              ? `Ni har fått ${formatPoints(outcome.points)} än så länge.`
              : `Ni fick ${formatPoints(outcome.points)}`}
          </p>
        </>
      )}
    </section>
  );
}
