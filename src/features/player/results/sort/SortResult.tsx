import { GripVertical } from "lucide-react";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, litOrders, PartEnd, resultClass } from "@/features/player/results/resultLook";

// The team's order between the question's labels, numbered with its handles as when it was sorted;
// each place that scored lights up with its points (D59).
export function SortResult({ shown, answer, outcome }: ResultViewProps<"sort">) {
  const orders = litOrders(outcome.parts);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{shown.firstLabel}</p>
      <ol className="flex flex-col gap-2">
        {answer.order.map((item, index) => {
          const part = outcome.parts[index];
          return (
            <li
              key={`${index}-${part?.result}`}
              style={glowDelay(orders[index])}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border bg-card px-3.5 text-lg ${resultClass(part?.result)}`}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/15 text-sm">{index + 1}</span>
              <span className="min-w-0 flex-1">{item}</span>
              <PartEnd part={part} />
              <GripVertical aria-hidden="true" className="size-4 shrink-0 opacity-60" />
            </li>
          );
        })}
      </ol>
      <p className="text-sm font-medium">{shown.lastLabel}</p>
    </div>
  );
}
