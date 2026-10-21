"use client";

import { useId, useState } from "react";
import type { QuestionType } from "@convex/questions/questionContent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { questionEditors } from "@/features/host/authoring/questionEditors/registry";

type AddQuestionFormProps = {
  label: string;
  buttonLabel: string;
  types: QuestionType[];
  onAdd: (type: QuestionType) => Promise<unknown>;
};

// Picks the type of a new question and adds it: to a round, or after a film (D32).
export function AddQuestionForm({ label, buttonLabel, types, onAdd }: AddQuestionFormProps) {
  const id = useId();
  const [type, setType] = useState<QuestionType>(types[0]);
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed p-3">
      <div className="flex min-w-40 flex-1 flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <select
          id={id}
          value={type}
          onChange={(event) => setType(event.target.value as QuestionType)}
          className="h-9 rounded-lg border bg-background pl-3 pr-9 text-sm"
        >
          {types.map((option) => (
            <option key={option} value={option}>
              {questionEditors[option].label}
            </option>
          ))}
        </select>
      </div>
      <Button variant="outline" onClick={() => onAdd(type)}>
        {buttonLabel}
      </Button>
    </div>
  );
}
