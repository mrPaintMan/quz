"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDecimal } from "@/domain/text/formatDecimal";
import { parseDecimal } from "@/domain/text/parseDecimal";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { useDraftText } from "@/features/shared/forms/useDraftText";

// One big field that opens the phone's number pad; a decimal comma and minus work ("3,5", "-2").
export function NumberInput({ answer, disabled, onChange }: AnswerInputProps<"number">) {
  const id = useId();
  const [text, setText] = useDraftText(answer?.value ?? null, formatDecimal, parseDecimal);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        Ert svar
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange({ type: "number", value: parseDecimal(event.target.value) });
        }}
        className="h-16 text-center text-3xl font-semibold tabular-nums"
      />
    </div>
  );
}
