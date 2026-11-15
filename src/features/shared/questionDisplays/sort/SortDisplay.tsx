import type { SortShown } from "@/domain/questionTypes/sort/sortAnswering";
import type { RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// Up to this many items fit one column under a two-line title; more go in two columns, read down
// the first and then the second, and past twice that the text shrinks too (D64).
const ONE_COLUMN = 5;

// The items numbered top to bottom, between the question's two labels.
function OrderedItems({ items, firstLabel, lastLabel }: Omit<SortShown, "type">) {
  const columns = items.length > ONE_COLUMN ? 2 : 1;
  const textSize = items.length > ONE_COLUMN * 2 ? "text-[1.8cqw]" : "text-[2.4cqw]";
  return (
    <div className="flex min-h-0 flex-col gap-[0.8cqw]">
      <p className="text-[1.8cqw] text-muted-foreground">{firstLabel}</p>
      <ol
        className="grid grid-flow-col gap-x-[2cqw] gap-y-[0.8cqw]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.ceil(items.length / columns)}, auto)` }}
      >
        {items.map((item, index) => (
          <li key={item} className={`flex items-center gap-[1.4cqw] rounded-[1cqw] bg-card px-[1.6cqw] py-[0.6cqw] font-semibold ${textSize}`}>
            <span className="w-[2.4cqw] shrink-0 text-muted-foreground tabular-nums">{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
      <p className="text-[1.8cqw] text-muted-foreground">{lastLabel}</p>
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
