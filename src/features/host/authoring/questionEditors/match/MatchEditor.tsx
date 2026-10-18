"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/shared/RowButtons";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function MatchEditor({ content, onChange }: QuestionEditorProps<"match">) {
  const { pairs } = content;
  type Pair = (typeof pairs)[number];
  const updatePair = (index: number, pair: Pair) => onChange({ ...content, pairs: replaceAt(pairs, index, pair) });

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          Korrekta par · Den högra sidan blandas för deltagarna
        </legend>
        {pairs.map((pair, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <Input aria-label={`Par ${index + 1}, vänster`} value={pair.left} onChange={(event) => updatePair(index, { ...pair, left: event.target.value })} />
            <span aria-hidden="true" className="text-muted-foreground">↔</span>
            <Input aria-label={`Par ${index + 1}, höger`} value={pair.right} onChange={(event) => updatePair(index, { ...pair, right: event.target.value })} />
            <RowButtons name={`par ${index + 1}`} onRemove={() => onChange({ ...content, pairs: removeAt(pairs, index) })} />
          </div>
        ))}
      </fieldset>
      <Button variant="outline" className="self-start" onClick={() => onChange({ ...content, pairs: [...pairs, { left: "", right: "" }] })}>
        Lägg till par
      </Button>
      <NumberField label="Poäng per rätt par" value={content.pointsPerPair} onChange={(pointsPerPair) => onChange({ ...content, pointsPerPair })} className="max-w-48" />
    </div>
  );
}
