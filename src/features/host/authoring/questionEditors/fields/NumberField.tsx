"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDecimal } from "@/domain/text/formatDecimal";
import { parseDecimal } from "@/domain/text/parseDecimal";

type NumberFieldProps = {
  label: string;
  value: number | null;
  // Empty or invalid input is passed on as NaN; the question rules report it.
  onChange: (value: number) => void;
  className?: string;
};

// Keeps the typed text locally so "0," can be typed on the way to "0,5".
export function NumberField({ label, value, onChange, className }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => formatDecimal(value));
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(parseDecimal(event.target.value));
        }}
      />
    </div>
  );
}
