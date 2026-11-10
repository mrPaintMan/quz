"use client";

import { AnswerKeyField } from "@/features/host/authoring/questionEditors/fields/AnswerKeyField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function ListEditor({ content, onChange }: QuestionEditorProps<"list">) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Deltagarna skriver så många svar de kan tills tiden tar slut. Facit får vara ofullständigt: rätta svar som inte finns
        där räknas också, och samma svar i olika former räknas en gång.
      </p>
      <AnswerKeyField
        label="Facit (valfritt)"
        value={content.acceptedItems}
        onChange={(acceptedItems) => onChange({ ...content, acceptedItems })}
      />
      <NumberField label="Poäng per rätt svar" value={content.pointsPerItem} onChange={(pointsPerItem) => onChange({ ...content, pointsPerItem })} className="max-w-48" />
      <SwitchField
        label="Låt AI bedöma nästan rätt svar"
        description="Svar som inte stämmer exakt med facit bedöms av AI när frågan stängs, också rätta svar som saknas i facit; osäkra hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
    </div>
  );
}
