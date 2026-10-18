"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDecimal } from "@/domain/text/formatDecimal";
import { parseDecimal } from "@/domain/text/parseDecimal";
import { useDraftText } from "./useDraftText";

type NumberFieldProps = {
  label: string;
  value: number | null;
  // Empty or invalid input is passed on as null; the question rules report it.
  onChange: (value: number | null) => void;
  className?: string;
};

export function NumberField({ label, value, onChange, className }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useDraftText(value, formatDecimal, parseDecimal);
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
