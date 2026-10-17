"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type SwitchFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SwitchField({ label, description, checked, onChange }: SwitchFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
