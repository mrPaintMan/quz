"use client";

import { Button } from "@/components/ui/button";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

const DEFAULT_RANK_POINTS = [3, 2, 1];

export function NumberEditor({ content, onChange }: QuestionEditorProps<"number">) {
  const { scoring } = content;

  return (
    <div className="flex flex-col gap-4">
      <NumberField
        label="Rätt svar"
        value={content.answer}
        onChange={(answer) => onChange({ ...content, answer: Number.isNaN(answer) ? null : answer })}
        className="max-w-60"
      />
      <fieldset className="flex flex-wrap gap-2" aria-label="Poängsättning">
        <Button
          variant={scoring.mode === "tiers" ? "default" : "outline"}
          aria-pressed={scoring.mode === "tiers"}
          onClick={() => onChange({ ...content, scoring: { mode: "tiers", tiers: [{ within: 0, points: 1 }] } })}
        >
          Poängnivåer (±)
        </Button>
        <Button
          variant={scoring.mode === "closest" ? "default" : "outline"}
          aria-pressed={scoring.mode === "closest"}
          onClick={() => onChange({ ...content, scoring: { mode: "closest", pointsByRank: DEFAULT_RANK_POINTS } })}
        >
          Närmast vinner
        </Button>
      </fieldset>

      {scoring.mode === "tiers" && (
        <div className="flex flex-col gap-3">
          {scoring.tiers.map((tier, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3">
              <NumberField
                label={`Nivå ${index + 1}: inom ±`}
                value={tier.within}
                onChange={(within) => onChange({ ...content, scoring: { ...scoring, tiers: replaceAt(scoring.tiers, index, { ...tier, within }) } })}
                className="w-40"
              />
              <NumberField
                label={`Nivå ${index + 1}: poäng`}
                value={tier.points}
                onChange={(points) => onChange({ ...content, scoring: { ...scoring, tiers: replaceAt(scoring.tiers, index, { ...tier, points }) } })}
                className="w-32"
              />
              <RowButtons
                name={`nivå ${index + 1}`}
                onRemove={() => onChange({ ...content, scoring: { ...scoring, tiers: removeAt(scoring.tiers, index) } })}
              />
            </div>
          ))}
          <Button
            variant="outline"
            className="self-start"
            onClick={() => onChange({ ...content, scoring: { ...scoring, tiers: [...scoring.tiers, { within: Number.NaN, points: Number.NaN }] } })}
          >
            Lägg till nivå
          </Button>
        </div>
      )}

      {scoring.mode === "closest" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Poäng delas ut till de som kom närmast.</p>
          {scoring.pointsByRank.map((points, index) => (
            <div key={index} className="flex items-end gap-3">
              <NumberField
                label={`Plats ${index + 1}: poäng`}
                value={points}
                onChange={(value) => onChange({ ...content, scoring: { ...scoring, pointsByRank: replaceAt(scoring.pointsByRank, index, value) } })}
                className="w-40"
              />
              <RowButtons
                name={`plats ${index + 1}`}
                onRemove={() => onChange({ ...content, scoring: { ...scoring, pointsByRank: removeAt(scoring.pointsByRank, index) } })}
              />
            </div>
          ))}
          <Button
            variant="outline"
            className="self-start"
            onClick={() => onChange({ ...content, scoring: { ...scoring, pointsByRank: [...scoring.pointsByRank, Number.NaN] } })}
          >
            Lägg till placering
          </Button>
        </div>
      )}
    </div>
  );
}
