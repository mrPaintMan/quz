"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moveItem } from "@/domain/ordering/moveItem";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import { TextField } from "@/features/host/authoring/questionEditors/fields/TextField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

export function SortEditor({ content, onChange }: QuestionEditorProps<"sort">) {
  const { items } = content;
  const setItems = (next: string[]) => onChange({ ...content, items: next });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <TextField label="Högst upp betyder" placeholder="Störst" value={content.firstLabel} onChange={(firstLabel) => onChange({ ...content, firstLabel })} className="flex-1" />
        <TextField label="Längst ner betyder" placeholder="Minst" value={content.lastLabel} onChange={(lastLabel) => onChange({ ...content, lastLabel })} className="flex-1" />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Alternativ i rätt ordning · ordningen blandas för deltagarna</legend>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-6 text-right text-muted-foreground">{index + 1}.</span>
            <Input aria-label={`Alternativ ${index + 1}`} value={item} onChange={(event) => setItems(replaceAt(items, index, event.target.value))} />
            <RowButtons
              name={`alternativ ${index + 1}`}
              onMoveUp={index > 0 ? () => setItems(moveItem(items, index, index - 1)) : undefined}
              onMoveDown={index < items.length - 1 ? () => setItems(moveItem(items, index, index + 1)) : undefined}
              onRemove={() => setItems(removeAt(items, index))}
            />
          </div>
        ))}
      </fieldset>
      <Button variant="outline" className="self-start" onClick={() => setItems([...items, ""])}>
        Lägg till alternativ
      </Button>
      <NumberField label="Poäng per rätt placering" value={content.pointsPerItem} onChange={(pointsPerItem) => onChange({ ...content, pointsPerItem })} className="max-w-48" />
    </div>
  );
}
