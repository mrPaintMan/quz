"use client";

import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function ActivityEditor({ content, onChange }: QuestionEditorProps<"activity">) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Beskriv aktiviteten i frågetexten. Deltagarnas mobiler visar att en aktivitet pågår, och ni delar ut poängen själva.
      </p>
      <NumberField label="Maxpoäng" value={content.maxPoints} onChange={(maxPoints) => onChange({ ...content, maxPoints })} className="max-w-40" />
    </div>
  );
}
