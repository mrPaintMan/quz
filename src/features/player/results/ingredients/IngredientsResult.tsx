import { isBlank } from "@/domain/questionTypes/isBlank";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, litOrders, PartEnd, ResultNote, resultClass } from "@/features/player/results/resultLook";
import { partsOfTexts } from "@/features/player/results/textParts";

// The numbered fields as the team filled them in; each ingredient that scored lights up with its
// points, and another form of one already counted fades with why (D59).
export function IngredientsResult({ shown, answer, outcome }: ResultViewProps<"ingredients">) {
  const items = Array.from({ length: shown.count }, (_, index) => answer.items[index] ?? "");
  const parts = partsOfTexts(items.length, outcome.parts);
  const orders = litOrders(parts);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{shown.count} ingredienser · ordningen spelar ingen roll</p>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => {
          const part = parts[index];
          return (
            <li key={index} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${isBlank(item) ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {index + 1}
              </span>
              <div
                key={part?.result}
                style={glowDelay(orders[index])}
                className={`flex min-h-13 flex-1 items-center gap-3 rounded-md border bg-card px-3 py-1.5 text-lg ${resultClass(part?.result)}`}
              >
                <span className="flex min-w-0 flex-1 flex-col break-words">
                  {isBlank(item) ? <span className="text-muted-foreground/60">{`Ingrediens ${index + 1}`}</span> : item}
                  <ResultNote result={part?.result} />
                </span>
                <PartEnd part={part} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
