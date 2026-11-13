"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_TYPED_TEXT_LENGTH } from "@/domain/answering/registry";
import { brakePointsOf } from "@/domain/questionTypes/paSparet/paSparetAnswering";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";

// The team writes where the trip goes, and can change it until it pulls the brake, which sends it
// (D63); once locked, the guess shows with the points it braked at, or that it never braked.
export function PaSparetInput({ answer, disabled, onChange }: AnswerInputProps<"paSparet">) {
  const id = useId();
  const brakePoints = brakePointsOf(answer?.brakeClueIndex ?? null);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        Ert resmål
      </Label>
      <Input
        id={id}
        value={answer?.guess ?? ""}
        disabled={disabled}
        autoComplete="off"
        maxLength={MAX_TYPED_TEXT_LENGTH}
        onChange={(event) => onChange({ type: "paSparet", guess: event.target.value, brakeClueIndex: null })}
        className="h-13 text-lg"
      />
      {brakePoints !== null && <p className="text-lg font-semibold text-primary">Bromsade vid {formatPoints(brakePoints)}</p>}
      {disabled && answer && brakePoints === null && <p className="text-lg text-muted-foreground">Ni bromsade inte.</p>}
    </div>
  );
}
