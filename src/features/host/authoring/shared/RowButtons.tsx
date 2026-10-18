"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Where an ordered row sits, so the arrows can move it.
export type RowPosition = {
  index: number;
  count: number;
  onMove: (toIndex: number) => void;
};

type RowButtonsProps = {
  // What the row is called in screen-reader labels, such as "alternativ 2".
  name: string;
  position?: RowPosition;
  onRemove?: () => void;
};

export function RowButtons({ name, position, onRemove }: RowButtonsProps) {
  return (
    <div className="flex shrink-0 gap-1">
      {position && (
        // Both arrows stay at the ends, disabled, so rows don't shift sideways.
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Flytta upp ${name}`}
            disabled={position.index === 0}
            onClick={() => position.onMove(position.index - 1)}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Flytta ned ${name}`}
            disabled={position.index === position.count - 1}
            onClick={() => position.onMove(position.index + 1)}
          >
            <ArrowDown />
          </Button>
        </>
      )}
      {onRemove && (
        <Button variant="ghost" size="icon" aria-label={`Ta bort ${name}`} onClick={onRemove}>
          <X />
        </Button>
      )}
    </div>
  );
}
