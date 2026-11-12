import { rowsOfAnswer } from "@/domain/questionTypes/match/matchRows";
import { curveBetween, LINES_WIDTH, listsHeight, ROW_GAP, ROW_HEIGHT } from "@/features/player/answering/match/matchGeometry";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PointsBadge } from "@/features/player/results/resultLook";

const rowClass = "relative z-10 flex items-center justify-between gap-1 rounded-2xl border-2 border-border bg-card px-3 text-base leading-tight";

// The team's pairs with the lines between them, laid out as when it drew them (D47); a pair that
// scored lights up, both items and its line, with its points by the left item, and the other
// lines turn grey (D59).
export function MatchResult({ shown, answer, outcome }: ResultViewProps<"match">) {
  const rowByLeft = rowsOfAnswer(answer.rightByLeft, shown.right);
  const isRight = (left: number) => outcome.parts[left]?.result === "right";
  const litRight = new Set(rowByLeft.flatMap((row, left) => (row !== null && isRight(left) ? [row] : [])));
  // Each lit pair's place in the order they light up, by its left row.
  const orderOf = new Map(rowByLeft.flatMap((_row, left) => (isRight(left) ? [left] : [])).map((left, order) => [left, order]));
  const height = listsHeight(Math.max(shown.left.length, shown.right.length));
  const pairCount = rowByLeft.filter((row) => row !== null).length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{`${pairCount} av ${shown.left.length} par`}</p>
      <div className="grid items-start" style={{ gridTemplateColumns: `1fr ${LINES_WIDTH}px 1fr` }}>
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {shown.left.map((text, left) => (
            <div
              key={`${left}-${isRight(left)}`}
              style={{ height: ROW_HEIGHT, ...glowDelay(orderOf.get(left) ?? 0) }}
              className={`${rowClass} ${isRight(left) ? "result-lit" : ""}`}
            >
              <span className="line-clamp-2">{text}</span>
              {isRight(left) && <PointsBadge points={outcome.parts[left].points} className="px-1.5 text-xs" />}
            </div>
          ))}
        </div>
        <svg aria-hidden="true" width={LINES_WIDTH} height={height} className="overflow-visible">
          {rowByLeft.map((row, left) =>
            row === null ? null : (
              <path
                key={left}
                d={curveBetween(left, row)}
                fill="none"
                stroke={isRight(left) ? "var(--primary)" : "var(--muted-foreground)"}
                strokeOpacity={isRight(left) ? 1 : 0.5}
                strokeWidth={isRight(left) ? 4 : 2.5}
                strokeLinecap="round"
              />
            ),
          )}
        </svg>
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {shown.right.map((text, row) => {
            const left = rowByLeft.indexOf(row);
            return (
              <div
                key={`${row}-${litRight.has(row)}`}
                style={{ height: ROW_HEIGHT, ...glowDelay(orderOf.get(left) ?? 0) }}
                className={`${rowClass} ${litRight.has(row) ? "result-lit" : ""}`}
              >
                <span className="line-clamp-2">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
