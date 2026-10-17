"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseLines } from "@/domain/text/parseLines";

type LinesFieldProps = {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

// One value per line, such as the accepted spellings of an answer. Typed text is kept while
// it means the same as the value; a change from outside (a removed row above) replaces it.
export function LinesField({ label, hint, value, onChange }: LinesFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => value.join("\n"));
  const [shownValue, setShownValue] = useState(value.join("\n"));
  // React's pattern for adjusting state when a prop changes: done during render, no effect.
  if (value.join("\n") !== shownValue) {
    setShownValue(value.join("\n"));
    if (parseLines(text).join("\n") !== value.join("\n")) setText(value.join("\n"));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <Textarea
        id={id}
        rows={3}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(parseLines(event.target.value));
        }}
      />
    </div>
  );
}
