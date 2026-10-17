"use client";

import { AnswerKeyField } from "@/features/host/authoring/questionEditors/fields/AnswerKeyField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function IngredientsEditor({ content, onChange }: QuestionEditorProps<"ingredients">) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Lagen får ett svarsfält per ingrediens och kan skriva dem i vilken ordning som helst.
      </p>
      <AnswerKeyField label="Ingredienser" value={content.items} onChange={(items) => onChange({ ...content, items })} />
      <NumberField label="Poäng per rätt ingrediens" value={content.pointsPerItem} onChange={(pointsPerItem) => onChange({ ...content, pointsPerItem })} className="max-w-48" />
      <SwitchField
        label="Rätta med ungefärlig matchning"
        description="Nästan rätt stavat räknas; osäkra svar hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
    </div>
  );
}
