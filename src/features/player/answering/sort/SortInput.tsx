"use client";

import { moveItem } from "@/domain/ordering/moveItem";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { SortableList } from "@/features/shared/sortable/SortableList";

const rowClass = "flex min-h-14 items-center gap-3 rounded-2xl border bg-card px-3.5 text-lg";

function Position({ index }: { index: number }) {
  return <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground">{index + 1}</span>;
}

// The items between the question's two labels, moved by holding and dragging their handle; they
// start in the order shown on the TV.
export function SortInput({ shown, answer, disabled, onChange }: AnswerInputProps<"sort">) {
  const order = answer?.order ?? shown.items;
  return (
    <div className="flex flex-col gap-2">
      {!disabled && <p className="text-sm text-muted-foreground">Håll och dra för att flytta</p>}
      <p className="text-sm font-medium">{shown.firstLabel}</p>
      {disabled ? (
        <ol className="flex flex-col gap-2 opacity-60">
          {order.map((item, index) => (
            <li key={item} className={rowClass}>
              <Position index={index} />
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <SortableList
          items={order}
          getId={(item) => item}
          nameOf={(item) => item}
          onMove={(_item, fromIndex, toIndex) => onChange({ type: "sort", order: moveItem(order, fromIndex, toIndex) })}
          className="flex flex-col gap-2"
          renderItem={(item, { index, dragHandle }) => (
            <div className={rowClass}>
              <Position index={index} />
              <span className="min-w-0 flex-1">{item}</span>
              {dragHandle}
            </div>
          )}
        />
      )}
      <p className="text-sm font-medium">{shown.lastLabel}</p>
    </div>
  );
}
