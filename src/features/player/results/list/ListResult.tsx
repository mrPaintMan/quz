import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, ResultNote, resultClass } from "@/features/player/results/resultLook";
import { partsOfTexts } from "@/features/player/results/textParts";

// The team's list, newest first as when it was written; each answer that scored lights up with its
// points, one waiting for a verdict says so, and another form of one already counted fades (D59).
export function ListResult({ answer, outcome }: ResultViewProps<"list">) {
  const parts = partsOfTexts(answer.items, outcome.parts);
  const rows = answer.items.map((item, index) => ({ item, index, part: parts[index] })).reverse();
  let lit = 0;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-primary">{answer.items.length} svar</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map(({ item, index, part }) => {
          const order = part?.result === "right" ? lit++ : 0;
          return (
            <li
              key={`${index}-${part?.result}`}
              style={glowDelay(order)}
              className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 ${resultClass(part?.result)}`}
            >
              <span className="flex min-w-0 flex-1 flex-col break-words">
                {item}
                <ResultNote result={part?.result} />
              </span>
              <PartEnd part={part} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
