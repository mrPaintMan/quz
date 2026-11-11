"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_TYPED_TEXT_LENGTH } from "@/domain/answering/registry";
import { MAX_LIST_ITEMS } from "@/domain/questionTypes/list/listAnswering";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";

// One field to add answers to the team's list one at a time, newest first, each removable until
// the answer locks. An answer already on the list, compared as everywhere else, is refused (D53).
export function ListInput({ answer, disabled, onChange }: AnswerInputProps<"list">) {
  const [text, setText] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const items = answer?.items ?? [];

  // Adds what is typed; also when the field loses focus, such as on tapping "Skicka svar", so a last
  // answer isn't lost. Pressing "Lägg till" keeps the keyboard up for the next one.
  const add = (keepFocus: boolean) => {
    const item = text.trim();
    if (keepFocus) field.current?.focus();
    if (item === "") return;
    if (items.some((existing) => normalizeForComparison(existing) === normalizeForComparison(item))) {
      setProblem("Det finns redan.");
    } else if (items.length >= MAX_LIST_ITEMS) {
      setProblem(`Listan är full med ${MAX_LIST_ITEMS} svar.`);
    } else {
      onChange({ type: "list", items: [...items, item] });
      setText("");
      setProblem(null);
    }
  };
  const remove = (index: number) => onChange({ type: "list", items: items.filter((_, other) => other !== index) });

  return (
    <div className="flex flex-col gap-3">
      {!disabled && (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            add(true);
          }}
        >
          <Input
            ref={field}
            value={text}
            maxLength={MAX_TYPED_TEXT_LENGTH}
            placeholder="Skriv ett svar"
            aria-label="Nytt svar"
            autoComplete="off"
            enterKeyHint="done"
            onBlur={() => add(false)}
            onChange={(event) => {
              setText(event.target.value);
              setProblem(null);
            }}
            className="h-13 text-lg"
          />
          <Button type="submit" variant="outline" className="h-13 shrink-0">
            Lägg till
          </Button>
        </form>
      )}
      {problem && (
        <p role="alert" className="text-sm text-destructive">
          {problem}
        </p>
      )}
      <p className="flex justify-between gap-3 text-sm">
        <span className="text-primary">{items.length} svar</span>
        {!disabled && <span className="text-muted-foreground">Bara tillagda svar räknas.</span>}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items
          .map((item, index) => ({ item, index }))
          .reverse()
          .map(({ item, index }) => (
            <li key={`${index}-${item}`} className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5">
              <span className="min-w-0 flex-1 break-words">{item}</span>
              {!disabled && (
                <Button variant="ghost" size="sm" aria-label={`Ta bort ${item}`} onClick={() => remove(index)}>
                  ✕
                </Button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
