"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { FileButton } from "@/features/host/authoring/media/FileButton";
import { MediaPreview } from "@/features/host/authoring/media/MediaPreview";
import { useUploadFile } from "@/features/host/authoring/media/useUploadFile";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

const MAX_OPTIONS = 6;
const LETTERS = "ABCDEF";

export function MultipleChoiceEditor({ content, onChange }: QuestionEditorProps<"multipleChoice">) {
  const uploadFile = useUploadFile();
  const radioGroup = useId();
  const { options, correctIndex } = content;
  type Option = (typeof options)[number];
  const updateOption = (index: number, option: Option) => onChange({ ...content, options: replaceAt(options, index, option) });

  function removeOption(index: number) {
    const shifted = correctIndex === null || correctIndex === index ? null : correctIndex > index ? correctIndex - 1 : correctIndex;
    onChange({ ...content, options: removeAt(options, index), correctIndex: shifted });
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Alternativ · markera det rätta</legend>
        {options.map((option, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={radioGroup}
                className="size-5 accent-primary"
                aria-label={`Alternativ ${LETTERS[index]} är rätt`}
                checked={correctIndex === index}
                onChange={() => onChange({ ...content, correctIndex: index })}
              />
              <span className="w-5 font-semibold text-muted-foreground">{LETTERS[index]}</span>
              <Input
                aria-label={`Alternativ ${LETTERS[index]}`}
                value={option.text}
                onChange={(event) => updateOption(index, { ...option, text: event.target.value })}
              />
              <RowButtons name={`alternativ ${LETTERS[index]}`} onRemove={() => removeOption(index)} />
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-12">
              {option.imageId && <MediaPreview storageId={option.imageId} kind="image" alt={`Bild för alternativ ${LETTERS[index]}`} />}
              <FileButton
                accept="image/*"
                onFile={async (file) => updateOption(index, { ...option, imageId: await uploadFile(file) })}
              >
                {option.imageId ? "Byt bild" : "Lägg till bild"}
              </FileButton>
              {option.imageId && (
                <Button variant="ghost" onClick={() => updateOption(index, { ...option, imageId: null })}>
                  Ta bort bild
                </Button>
              )}
            </div>
          </div>
        ))}
      </fieldset>
      {options.length < MAX_OPTIONS && (
        <Button
          variant="outline"
          className="self-start"
          onClick={() => onChange({ ...content, options: [...options, { text: "", imageId: null }] })}
        >
          Lägg till alternativ
        </Button>
      )}
      <NumberField label="Poäng" value={content.points} onChange={(points) => onChange({ ...content, points })} className="max-w-40" />
    </div>
  );
}
