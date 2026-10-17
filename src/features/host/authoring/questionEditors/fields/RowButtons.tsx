"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RowButtonsProps = {
  // What the row is called in screen-reader labels, such as "alternativ 2".
  name: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
};

export function RowButtons({ name, onMoveUp, onMoveDown, onRemove }: RowButtonsProps) {
  return (
    <div className="flex shrink-0 gap-1">
      {onMoveUp && (
        <Button variant="ghost" size="icon" aria-label={`Flytta upp ${name}`} onClick={onMoveUp}>
          <ArrowUp />
        </Button>
      )}
      {onMoveDown && (
        <Button variant="ghost" size="icon" aria-label={`Flytta ned ${name}`} onClick={onMoveDown}>
          <ArrowDown />
        </Button>
      )}
      {onRemove && (
        <Button variant="ghost" size="icon" aria-label={`Ta bort ${name}`} onClick={onRemove}>
          <X />
        </Button>
      )}
    </div>
  );
}
