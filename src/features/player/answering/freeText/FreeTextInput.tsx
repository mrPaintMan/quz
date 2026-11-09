"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { fieldTitle } from "@/features/shared/questionDisplays/freeText/fieldTitle";

// One field per sub-question, titled by its letter and label; a single field is just "Ert svar".
export function FreeTextInput({ shown, answer, disabled, onChange }: AnswerInputProps<"freeText">) {
  const id = useId();
  const { labels } = shown;
  // Always one field per label, also if the hosts change how many while the question shows.
  const fields = labels.map((_, index) => answer?.fields[index] ?? "");
  const write = (index: number, text: string) =>
    onChange({ type: "freeText", fields: fields.map((field, other) => (other === index ? text : field)) });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Label htmlFor={`${id}-${index}`} className="text-sm text-muted-foreground">
            {labels.length > 1 ? fieldTitle(labels, index) : "Ert svar"}
          </Label>
          <Input
            id={`${id}-${index}`}
            value={field}
            disabled={disabled}
            autoComplete="off"
            onChange={(event) => write(index, event.target.value)}
            className="h-13 text-lg"
          />
        </div>
      ))}
      {!disabled && labels.length > 1 && <p className="text-sm text-muted-foreground">Ni kan lämna ett fält tomt.</p>}
    </div>
  );
}
