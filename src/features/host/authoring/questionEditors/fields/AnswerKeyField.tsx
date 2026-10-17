"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAnswerKey } from "@/domain/text/formatAnswerKey";
import { parseAnswerKey, type AnswerKeyItem } from "@/domain/text/parseAnswerKey";

type AnswerKeyFieldProps = {
  label: string;
  value: AnswerKeyItem[];
  onChange: (value: AnswerKeyItem[]) => void;
};

// A bulk-pasteable answer key: one item per line, spellings separated by "/" (D19).
export function AnswerKeyField({ label, value, onChange }: AnswerKeyFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => formatAnswerKey(value));
  const [shownValue, setShownValue] = useState(formatAnswerKey(value));
  // Typed text is kept while it means the same as the value; a change from outside replaces it.
  if (formatAnswerKey(value) !== shownValue) {
    setShownValue(formatAnswerKey(value));
    if (formatAnswerKey(parseAnswerKey(text)) !== formatAnswerKey(value)) setText(formatAnswerKey(value));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <p className="text-sm text-muted-foreground">
        En per rad. Skriv andra stavningar efter snedstreck, till exempel “Köpenhamn / København”. Klistra gärna in en
        hel lista.
      </p>
      <Textarea
        id={id}
        rows={6}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(parseAnswerKey(event.target.value));
        }}
      />
      <p className="text-sm text-muted-foreground">{value.length} st</p>
    </div>
  );
}
