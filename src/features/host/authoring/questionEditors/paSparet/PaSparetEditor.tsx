"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { LinesField } from "@/features/host/authoring/questionEditors/fields/LinesField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function PaSparetEditor({ content, onChange }: QuestionEditorProps<"paSparet">) {
  const { clues } = content;
  type Clue = (typeof clues)[number];
  const updateClue = (index: number, clue: Clue) => onChange({ ...content, clues: replaceAt(clues, index, clue) });

  return (
    <div className="flex flex-col gap-4">
      <LinesField
        label="Resmålet"
        hint="En stavning per rad."
        value={content.acceptedAnswers}
        onChange={(acceptedAnswers) => onChange({ ...content, acceptedAnswers })}
      />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Ledtrådar, från svårast till lättast</legend>
        {clues.map((clue, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            <div className="flex flex-wrap items-end gap-3">
              <NumberField label={`Ledtråd ${index + 1}: poäng`} value={clue.points} onChange={(points) => updateClue(index, { ...clue, points })} className="w-40" />
              <div className="flex-1" />
              <RowButtons name={`ledtråd ${index + 1}`} onRemove={() => onChange({ ...content, clues: removeAt(clues, index) })} />
            </div>
            <Textarea
              aria-label={`Ledtråd ${index + 1}`}
              rows={2}
              value={clue.text}
              onChange={(event) => updateClue(index, { ...clue, text: event.target.value })}
            />
          </div>
        ))}
      </fieldset>
      <Button variant="outline" className="self-start" onClick={() => onChange({ ...content, clues: [...clues, { text: "", points: Number.NaN }] })}>
        Lägg till ledtråd
      </Button>
      <SwitchField
        label="Rätta med ungefärlig matchning"
        description="Nästan rätt stavat räknas; osäkra svar hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
    </div>
  );
}
