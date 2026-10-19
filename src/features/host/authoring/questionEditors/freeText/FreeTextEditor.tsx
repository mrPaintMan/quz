"use client";

import { Button } from "@/components/ui/button";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { LinesField } from "@/features/host/authoring/questionEditors/fields/LinesField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RemoveRowButton } from "@/features/host/authoring/shared/RemoveRowButton";
import { SwitchField } from "@/features/host/authoring/questionEditors/fields/SwitchField";
import { TextField } from "@/features/host/authoring/questionEditors/fields/TextField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

const MAX_FIELDS = 3;
const LETTERS = "abc";

export function FreeTextEditor({ content, onChange }: QuestionEditorProps<"freeText">) {
  const { fields } = content;
  type Field = (typeof fields)[number];
  const updateField = (index: number, field: Field) => onChange({ ...content, fields: replaceAt(fields, index, field) });
  const withSubQuestions = fields.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <section key={index} className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          {withSubQuestions && (
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Delfråga {LETTERS[index]})</h3>
              <RemoveRowButton
                name={`delfråga ${LETTERS[index]}`}
                onRemove={() => onChange({ ...content, fields: removeAt(fields, index) })}
              />
            </div>
          )}
          {withSubQuestions && (
            <TextField
              label="Text i svarsfältet"
              placeholder="Till exempel delfrågan igen"
              value={field.label}
              onChange={(label) => updateField(index, { ...field, label })}
            />
          )}
          <LinesField
            label="Godkända svar"
            hint="Ett per rad, med de stavningar som ska räknas."
            value={field.acceptedAnswers}
            onChange={(acceptedAnswers) => updateField(index, { ...field, acceptedAnswers })}
          />
        </section>
      ))}
      {fields.length < MAX_FIELDS && (
        <Button
          variant="outline"
          className="self-start"
          onClick={() => onChange({ ...content, fields: [...fields, { label: "", acceptedAnswers: [] }] })}
        >
          Lägg till delfråga
        </Button>
      )}
      <NumberField
        label={withSubQuestions ? "Poäng per delfråga" : "Poäng"}
        value={content.pointsPerField}
        onChange={(pointsPerField) => onChange({ ...content, pointsPerField })}
        className="max-w-40"
      />
      <SwitchField
        label="Rätta med ungefärlig matchning"
        description="Nästan rättstavat räknas; osäkra svar hamnar hos er för granskning."
        checked={content.fuzzy}
        onChange={(fuzzy) => onChange({ ...content, fuzzy })}
      />
    </div>
  );
}
