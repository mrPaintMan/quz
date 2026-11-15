import type { SortShown } from "@/domain/questionTypes/sort/sortAnswering";
import type { RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// Up to this many items fit one column under a two-line title; more go in two columns, and past
// ten in three, read down the first and then the next (D64).
const ONE_COLUMN = 5;
const TWO_COLUMNS = 10;

// Smaller text the longer the list, so even long items fit their share of the screen.
function textSizeFor(count: number): string {
  if (count <= ONE_COLUMN) return "text-[2.4cqw]";
  if (count <= 8) return "text-[1.8cqw]";
  return "text-[1.5cqw]";
}

// The items numbered top to bottom. The TV leaves out the two end labels, which the phones show;
// a question's description can say which way the order runs (D64). A long list takes the room
// left under the title and its rows share it evenly, so it never runs under what comes below.
function OrderedItems({ items }: Pick<SortShown, "items">) {
  const columns = items.length > TWO_COLUMNS ? 3 : items.length > ONE_COLUMN ? 2 : 1;
  const rows = Math.ceil(items.length / columns);
  return (
    <div className={`flex min-h-0 flex-col gap-[0.8cqw] ${columns > 1 ? "flex-1" : ""}`}>
      <ol
        className={`grid grid-flow-col gap-x-[2cqw] gap-y-[0.8cqw] ${columns > 1 ? "min-h-0 flex-1" : ""}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, ${columns > 1 ? "minmax(0, 1fr)" : "auto"})` }}
      >
        {items.map((item, index) => (
          <li
            key={item}
            className={`flex min-h-0 items-center gap-[1.4cqw] overflow-hidden rounded-[1cqw] bg-card px-[1.6cqw] py-[0.4cqw] leading-snug font-semibold ${textSizeFor(items.length)}`}
          >
            <span className="w-[2.4cqw] shrink-0 text-muted-foreground tabular-nums">{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

// The items in the shuffled order the phones start from.
export function SortQuestion({ shown }: ShownDisplayProps<"sort">) {
  return <OrderedItems {...shown} />;
}

// The right order.
export function SortAnswer({ revealed }: RevealedDisplayProps<"sort">) {
  return <OrderedItems {...revealed} />;
}
