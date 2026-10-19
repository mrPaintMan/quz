"use client";

import { Textarea } from "@/components/ui/textarea";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { clueText } from "@/domain/questionTypes/paSparet/clueText";
import { PA_SPARET_CLUE_POINTS } from "@/domain/questionTypes/paSparet/paSparetRules";
import { toFiveClueTexts } from "@/domain/questionTypes/paSparet/toFiveClueTexts";
import { LinesField } from "@/features/host/authoring/questionEditors/fields/LinesField";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function PaSparetEditor({ content, onChange }: QuestionEditorProps<"paSparet">) {
  // Saving any clue also brings a trip saved before D30 to five plain-text clues.
  const setClue = (index: number, text: string) =>
    onChange({ ...content, clues: replaceAt(toFiveClueTexts(content.clues), index, text) });

  return (
    <div className="flex flex-col gap-4">
      <LinesField
        label="Resmålet"
        hint="En stavning per rad."
        value={content.acceptedAnswers}
        onChange={(acceptedAnswers) => onChange({ ...content, acceptedAnswers })}
      />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Ledtrådar, från svårast till lättast</legend>
        <p className="text-sm text-muted-foreground">Ledtrådarna visas i jämn takt medan filmen spelas.</p>
        {PA_SPARET_CLUE_POINTS.map((points, index) => (
          <label key={points} className="flex flex-col gap-1.5">
            <span className="text-sm">
              Ledtråd {index + 1} · {points} p
            </span>
            <Textarea
              aria-label={`Ledtråd ${index + 1}`}
              rows={2}
              value={content.clues[index] === undefined ? "" : clueText(content.clues[index])}
              onChange={(event) => setClue(index, event.target.value)}
            />
          </label>
        ))}
      </fieldset>
      <SwitchField
        label="Rätta med ungefärlig matchning"
        description="Nästan rättstavat räknas; osäkra svar hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
    </div>
  );
}
