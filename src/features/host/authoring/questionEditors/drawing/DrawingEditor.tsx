"use client";

import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function DrawingEditor({ content, onChange }: QuestionEditorProps<"drawing">) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Deltagarna ritar med fingret. Teckningen skickas när tiden tar slut, och ni poängsätter den själva.
      </p>
      <NumberField label="Maxpoäng" value={content.maxPoints} onChange={(maxPoints) => onChange({ ...content, maxPoints })} className="max-w-40" />
    </div>
  );
}
