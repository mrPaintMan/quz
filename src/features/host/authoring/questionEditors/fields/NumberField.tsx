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

function sameNumber(a: number, b: number | null): boolean {
  const missing = (n: number | null) => n === null || Number.isNaN(n);
  return missing(a) ? missing(b) : a === b;
}

// Keeps the typed text locally so "0," can be typed on the way to "0,5", but shows the
// current value whenever it changes from outside (for example when a row above is removed).
export function NumberField({ label, value, onChange, className }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => formatDecimal(value));
  const [shownValue, setShownValue] = useState(value);
  // React's pattern for adjusting state when a prop changes: done during render, no effect.
  if (!sameNumber(value ?? Number.NaN, shownValue)) {
    setShownValue(value);
    if (!sameNumber(parseDecimal(text), value)) setText(formatDecimal(value));
  }
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
