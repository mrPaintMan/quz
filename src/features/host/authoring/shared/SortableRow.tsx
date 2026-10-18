"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

type SortableRowProps = {
  id: string;
  // What the row is called in the handle's label, such as "omgång 2".
  name: string;
  className?: string;
  children: (dragHandle: ReactNode) => ReactNode;
};

// One <li> of a SortableList; only its grip handle starts a drag, so buttons and inputs in the row still work.
export function SortableRow({ id, name, className, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Dra för att flytta ${name}`}
      className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:text-foreground active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`${className ?? ""} ${isDragging ? "relative z-10 opacity-80 shadow-lg" : ""}`}
    >
      {children(dragHandle)}
    </li>
  );
}
