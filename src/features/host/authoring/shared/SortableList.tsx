"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useRef, useState, type ReactNode } from "react";
import { findDragMove } from "@/domain/ordering/findDragMove";
import { moveItem } from "@/domain/ordering/moveItem";
import type { RowPosition } from "./RowButtons";
import { SortableRow } from "./SortableRow";
import { swedishDragAnnouncements, swedishDragInstructions } from "./swedishDragAnnouncements";

type SortableItemParts = { index: number; dragHandle: ReactNode; position: RowPosition };

type SortableListProps<T> = {
  items: readonly T[];
  getId: (item: T, index: number) => string;
  // What row `index` is called in labels, such as "omgång 2".
  nameOf: (index: number) => string;
  // Gets the item itself, since indices into the caller's list go stale while an earlier move is pending.
  // May return a promise (a server move); the new order shows until it settles.
  onMove: (item: T, fromIndex: number, toIndex: number) => unknown;
  className?: string;
  itemClassName?: (item: T, index: number) => string;
  renderItem: (item: T, parts: SortableItemParts) => ReactNode;
};

// An ordered list whose rows move by dragging their grip handle or by the arrows in RowButtons.
export function SortableList<T>({ items, getId, nameOf, onMove, className, itemClassName, renderItem }: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  // Without this the row would jump back until the server's new order arrives.
  const [pendingOrder, setPendingOrder] = useState<readonly T[] | null>(null);
  const movesInFlight = useRef(0);
  const shown = pendingOrder ?? items;
  const ids = shown.map(getId);

  const move = async (fromIndex: number, toIndex: number) => {
    setPendingOrder(moveItem(shown, fromIndex, toIndex));
    movesInFlight.current += 1;
    try {
      await onMove(shown[fromIndex], fromIndex, toIndex);
    } finally {
      movesInFlight.current -= 1;
      if (movesInFlight.current === 0) setPendingOrder(null);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const dragMove = findDragMove(ids, String(active.id), over ? String(over.id) : null);
    if (dragMove) void move(dragMove.fromIndex, dragMove.toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: swedishDragInstructions,
        announcements: swedishDragAnnouncements(
          (id) => nameOf(ids.indexOf(id)),
          (id) => ids.indexOf(id) + 1,
        ),
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className={className}>
          {shown.map((item, index) => (
            <SortableRow key={ids[index]} id={ids[index]} name={nameOf(index)} className={itemClassName?.(item, index)}>
              {(dragHandle) =>
                renderItem(item, {
                  index,
                  dragHandle,
                  position: { index, count: shown.length, onMove: (toIndex) => void move(index, toIndex) },
                })
              }
            </SortableRow>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
