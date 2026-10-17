"use client";

import { AnswerKeyField } from "@/features/host/authoring/questionEditors/fields/AnswerKeyField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function ListEditor({ content, onChange }: QuestionEditorProps<"list">) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Deltagarna skriver så många svar de kan tills tiden tar slut. Facit får vara ofullständigt: svar som inte finns där
        granskar ni en gång för alla lag.
      </p>
      <AnswerKeyField
        label="Facit (valfritt)"
        value={content.acceptedItems}
        onChange={(acceptedItems) => onChange({ ...content, acceptedItems })}
      />
      <NumberField label="Poäng per rätt svar" value={content.pointsPerItem} onChange={(pointsPerItem) => onChange({ ...content, pointsPerItem })} className="max-w-48" />
      <SwitchField
        label="Rätta med ungefärlig matchning"
        description="Nästan rättstavat räknas; osäkra svar hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
      <SwitchField
        label="Låt AI föreslå rättning"
        description="Svar som inte finns i facit skickas till Claude, som föreslår rätt eller fel. Ni bekräftar alltid själva."
        checked={content.aiAssist}
        onChange={(aiAssist) => onChange({ ...content, aiAssist })}
      />
    </div>
  );
}
