"use client";

import { useState } from "react";
import { rowsOfAnswer, tapRow, textsOfRows, type RowByLeft, type Selection } from "@/domain/questionTypes/match/matchRows";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";

// Every row is this tall with this gap, so the lines between the lists follow from the row
// numbers alone, with nothing to measure.
const ROW_HEIGHT = 64;
const ROW_GAP = 12;
const LINES_WIDTH = 40;

// One colour per pair, by its left row; told apart by lightness as well as hue.
const PAIR_COLOURS = ["#e8b04b", "#6fb08a", "#8fa8d9", "#d65a55", "#c58fd1", "#5fc4c4", "#e39b6b", "#b8c25a"];

const middleOf = (row: number) => row * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
const colourOf = (left: number) => PAIR_COLOURS[left % PAIR_COLOURS.length];

type RowProps = { text: string; colour: string | null; isSelected: boolean; disabled: boolean; label: string; onTap: () => void };

function Row({ text, colour, isSelected, disabled, label, onTap }: RowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={label}
      onClick={onTap}
      style={{ height: ROW_HEIGHT, borderColor: colour ?? undefined }}
      className={`flex items-center rounded-2xl border-2 px-3 text-left text-base leading-tight disabled:opacity-60 ${isSelected ? "border-foreground bg-secondary" : colour ? "bg-secondary" : "border-border bg-card"}`}
    >
      <span className="line-clamp-2">{text}</span>
    </button>
  );
}

// The team taps an item on one side, then its partner on the other, and a line in the pair's
// colour joins them; tapping a paired item takes its pair apart (D47).
export function MatchInput({ shown, answer, disabled, onChange }: AnswerInputProps<"match">) {
  const [rowByLeft, setRowByLeft] = useState<RowByLeft>(() =>
    answer ? rowsOfAnswer(answer.rightByLeft, shown.right) : shown.left.map(() => null),
  );
  const [selection, setSelection] = useState<Selection>(null);
  const pairCount = rowByLeft.filter((row) => row !== null).length;
  const height = Math.max(shown.left.length, shown.right.length) * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;

  const tap = (tapped: NonNullable<Selection>) => {
    const next = tapRow(rowByLeft, selection, tapped);
    setSelection(next.selection);
    if (next.rowByLeft !== rowByLeft) {
      setRowByLeft(next.rowByLeft);
      onChange({ type: "match", rightByLeft: textsOfRows(next.rowByLeft, shown.right) });
    }
  };
  const leftOfRight = (row: number) => rowByLeft.indexOf(row);
  const isSelected = (side: "left" | "right", index: number) => selection?.side === side && selection.index === index;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {disabled ? `${pairCount} av ${shown.left.length} par` : `Tryck på ett alternativ och sedan på dess par · ${pairCount} av ${shown.left.length} par`}
      </p>
      <div className="grid items-start" style={{ gridTemplateColumns: `1fr ${LINES_WIDTH}px 1fr` }}>
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {shown.left.map((text, index) => (
            <Row
              key={index}
              text={text}
              colour={rowByLeft[index] === null ? null : colourOf(index)}
              isSelected={isSelected("left", index)}
              disabled={disabled}
              label={`Lista A: ${text}`}
              onTap={() => tap({ side: "left", index })}
            />
          ))}
        </div>
        <svg aria-hidden="true" width={LINES_WIDTH} height={height} className="overflow-visible">
          {rowByLeft.map((row, left) =>
            row === null ? null : (
              <line key={left} x1={-2} y1={middleOf(left)} x2={LINES_WIDTH + 2} y2={middleOf(row)} stroke={colourOf(left)} strokeWidth={4} strokeLinecap="round" />
            ),
          )}
        </svg>
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {shown.right.map((text, index) => {
            const left = leftOfRight(index);
            return (
              <Row
                key={index}
                text={text}
                colour={left === -1 ? null : colourOf(left)}
                isSelected={isSelected("right", index)}
                disabled={disabled}
                label={`Lista B: ${text}`}
                onTap={() => tap({ side: "right", index })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
