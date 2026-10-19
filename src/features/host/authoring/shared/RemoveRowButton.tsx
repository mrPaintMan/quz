"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RemoveRowButtonProps = {
  // What the row is called in the screen-reader label, such as "alternativ 2".
  name: string;
  onRemove: () => void;
};

export function RemoveRowButton({ name, onRemove }: RemoveRowButtonProps) {
  return (
    <Button variant="ghost" size="icon" className="shrink-0" aria-label={`Ta bort ${name}`} onClick={onRemove}>
      <X />
    </Button>
  );
}
