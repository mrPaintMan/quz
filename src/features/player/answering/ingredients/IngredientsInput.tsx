"use client";

import { Input } from "@/components/ui/input";
import { isBlank } from "@/domain/questionTypes/isBlank";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";

// One numbered field per ingredient, in any order; empty rows are fine (as in the wireframe).
export function IngredientsInput({ shown, answer, disabled, onChange }: AnswerInputProps<"ingredients">) {
  // Always one field per ingredient, also if the hosts change how many while the question shows.
  const items = Array.from({ length: shown.count }, (_, index) => answer?.items[index] ?? "");
  const filled = items.filter((item) => !isBlank(item)).length;
  const write = (index: number, text: string) =>
    onChange({ type: "ingredients", items: items.map((item, other) => (other === index ? text : item)) });

  return (
    <div className="flex flex-col gap-2">
      <p className="flex justify-between gap-3 text-sm text-muted-foreground">
        <span>{shown.count} ingredienser · ordningen spelar ingen roll</span>
        <span className="shrink-0 text-primary">
          {filled} av {shown.count} ifyllda
        </span>
      </p>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${isBlank(item) ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"}`}
            >
              {index + 1}
            </span>
            <Input
              value={item}
              disabled={disabled}
              placeholder={`Ingrediens ${index + 1}`}
              aria-label={`Ingrediens ${index + 1}`}
              autoComplete="off"
              onChange={(event) => write(index, event.target.value)}
              className="h-13 text-lg"
            />
          </li>
        ))}
      </ol>
      {!disabled && <p className="text-sm text-muted-foreground">Tomma rader är okej.</p>}
    </div>
  );
}
