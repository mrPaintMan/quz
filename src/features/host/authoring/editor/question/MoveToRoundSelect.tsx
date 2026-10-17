"use client";

import { useId } from "react";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { QuestionType } from "@convex/questions/questionContent";
import { Label } from "@/components/ui/label";
import { isTypeAllowedInRound } from "@/domain/rounds/isTypeAllowedInRound";

type MoveToRoundSelectProps = {
  currentRoundId: Id<"rounds">;
  questionType: QuestionType;
  rounds: Doc<"rounds">[];
  onMove: (roundId: Id<"rounds">) => void;
};

// Lists only the other rounds this type fits in; hidden when there are none.
export function MoveToRoundSelect({ currentRoundId, questionType, rounds, onMove }: MoveToRoundSelectProps) {
  const id = useId();
  const targets = rounds.filter((round) => round._id !== currentRoundId && isTypeAllowedInRound(round.kind, questionType));
  if (targets.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>Flytta till rond</Label>
      <select
        id={id}
        value=""
        onChange={(event) => onMove(event.target.value as Id<"rounds">)}
        className="h-9 max-w-72 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="" disabled>
          Välj rond…
        </option>
        {targets.map((round) => (
          <option key={round._id} value={round._id}>
            {round.title}
          </option>
        ))}
      </select>
    </div>
  );
}
