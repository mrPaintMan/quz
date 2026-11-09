import type { SortShown } from "@/domain/questionTypes/sort/sortAnswering";
import type { RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The items numbered top to bottom, between the question's two labels.
function OrderedItems({ items, firstLabel, lastLabel }: Omit<SortShown, "type">) {
  return (
    <div className="flex min-h-0 flex-col gap-[0.8cqw]">
      <p className="text-[1.8cqw] text-muted-foreground">{firstLabel}</p>
      <ol className="flex flex-col gap-[0.8cqw]">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-[1.4cqw] rounded-[1cqw] bg-card px-[1.6cqw] py-[0.6cqw] text-[2.4cqw] font-semibold">
            <span className="w-[2.4cqw] text-muted-foreground tabular-nums">{index + 1}</span>
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
