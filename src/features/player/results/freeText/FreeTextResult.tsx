import { fieldTitle } from "@/domain/questionTypes/freeText/fieldTitle";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, ResultNote, resultClass } from "@/features/player/results/resultLook";

// One field per sub-question under its title, as the team filled them in; each that scored lights
// up with its points, and one waiting for a verdict says so (D59).
export function FreeTextResult({ shown, answer, outcome }: ResultViewProps<"freeText">) {
  const { labels } = shown;
  let lit = 0;
  return (
    <div className="flex flex-col gap-4">
      {labels.map((_label, index) => {
        const part = outcome.parts[index];
        const order = part?.result === "right" ? lit++ : 0;
        return (
          <div key={index} className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{labels.length > 1 ? fieldTitle(labels, index) : "Ert svar"}</p>
            <div
              key={part?.result}
              style={glowDelay(order)}
              className={`flex min-h-13 items-center gap-3 rounded-md border bg-card px-3 py-1.5 text-lg ${resultClass(part?.result)}`}
            >
              <span className="flex min-w-0 flex-1 flex-col break-words">
                {answer.fields[index]}
                <ResultNote result={part?.result} />
              </span>
              <PartEnd part={part} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
