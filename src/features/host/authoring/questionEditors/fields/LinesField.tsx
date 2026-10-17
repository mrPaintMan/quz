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

// One value per line, such as the accepted spellings of an answer.
export function LinesField({ label, hint, value, onChange }: LinesFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => value.join("\n"));
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
