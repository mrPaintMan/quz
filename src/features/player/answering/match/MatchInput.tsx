"use client";

import { useState } from "react";
import { leftOfRight, rowsOfAnswer, tapRow, textsOfRows, type RowByLeft, type Selection } from "@/domain/questionTypes/match/matchRows";
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

// A Bézier S-curve from a left row to a right row, leaving and arriving level, like the
// wireframe's lines; its ends reach just inside the rows' borders.
function curveBetween(leftRow: number, rightRow: number): string {
  const [fromX, toX, midX] = [-2, LINES_WIDTH + 2, LINES_WIDTH / 2];
  const [fromY, toY] = [middleOf(leftRow), middleOf(rightRow)];
  return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
}

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
  const rowsOf = (from: typeof answer): RowByLeft => (from ? rowsOfAnswer(from.rightByLeft, shown.right) : shown.left.map(() => null));
  // The rows are kept here, so a repeated right-hand text stays in the row the team tapped; they
  // follow the answer whenever it changes from outside, such as when the server locks its draft.
  const [rowByLeft, setRowByLeft] = useState<RowByLeft>(() => rowsOf(answer));
  const answerKey = JSON.stringify(answer?.rightByLeft ?? null);
  const [followedKey, setFollowedKey] = useState(answerKey);
  if (answerKey !== followedKey) {
    setFollowedKey(answerKey);
    setRowByLeft(rowsOf(answer));
  }
  const [selection, setSelection] = useState<Selection>(null);
  const pairCount = rowByLeft.filter((row) => row !== null).length;
  const height = Math.max(shown.left.length, shown.right.length) * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;

  const tap = (tapped: NonNullable<Selection>) => {
    const next = tapRow(rowByLeft, selection, tapped);
    setSelection(next.selection);
    if (next.rowByLeft !== rowByLeft) {
      const changed = { type: "match" as const, rightByLeft: textsOfRows(next.rowByLeft, shown.right) };
      setRowByLeft(next.rowByLeft);
      setFollowedKey(JSON.stringify(changed.rightByLeft));
      onChange(changed);
    }
  };
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
              <path key={left} d={curveBetween(left, row)} fill="none" stroke={colourOf(left)} strokeWidth={4} strokeLinecap="round" />
            ),
          )}
        </svg>
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {shown.right.map((text, index) => {
            const left = leftOfRight(rowByLeft, index);
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
