"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moveItem } from "@/domain/ordering/moveItem";
import { removeAt } from "@/domain/ordering/removeAt";
import { replaceAt } from "@/domain/ordering/replaceAt";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { RowButtons } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import { SortableList } from "@/features/host/authoring/questionEditors/fields/SortableList";
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
        <SortableList
          items={items}
          // Items are plain strings that may repeat, so the position is their id, as in the React keys before.
          getId={(_, index) => String(index)}
          nameOf={(index) => `alternativ ${index + 1}`}
          onMove={(_item, fromIndex, toIndex) => setItems(moveItem(items, fromIndex, toIndex))}
          className="flex flex-col gap-2"
          itemClassName={() => "flex items-center gap-2 rounded-lg bg-background"}
          renderItem={(item, { index, dragHandle, position }) => (
            <>
              {dragHandle}
              <span className="w-6 text-right text-muted-foreground">{index + 1}.</span>
              <Input aria-label={`Alternativ ${index + 1}`} value={item} onChange={(event) => setItems(replaceAt(items, index, event.target.value))} />
              <RowButtons name={`alternativ ${index + 1}`} position={position} onRemove={() => setItems(removeAt(items, index))} />
            </>
          )}
        />
      </fieldset>
      <Button variant="outline" className="self-start" onClick={() => setItems([...items, ""])}>
        Lägg till alternativ
      </Button>
      <NumberField label="Poäng per rätt placering" value={content.pointsPerItem} onChange={(pointsPerItem) => onChange({ ...content, pointsPerItem })} className="max-w-48" />
    </div>
  );
}
