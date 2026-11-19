import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, resultClass, RightAnswer } from "@/features/player/results/resultLook";

// The team's guess in the field it was typed in, lit with its points when it scored, red with the
// right number under it when not (D59, D67).
export function NumberResult({ outcome }: ResultViewProps<"number">) {
  const part = outcome.parts[0];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Ert svar</p>
      <div
        key={part?.result}
        style={glowDelay(0)}
        className={`flex min-h-16 flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-md border bg-card px-3 py-2 text-3xl font-semibold tabular-nums ${resultClass(part?.result)}`}
      >
        {part?.given}
        <PartEnd part={part} />
      </div>
      {part?.result === "wrong" && part.correct !== "" && <RightAnswer>{part.correct}</RightAnswer>}
    </div>
  );
}
