import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, resultClass } from "@/features/player/results/resultLook";

// The team's guess in the field it was typed in, lit with its points when it scored (D59).
export function NumberResult({ outcome }: ResultViewProps<"number">) {
  const part = outcome.parts[0];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Ert svar</p>
      <div
        key={part?.result}
        style={glowDelay(0)}
        className={`relative flex h-16 items-center justify-center rounded-md border bg-card text-3xl font-semibold tabular-nums ${resultClass(part?.result)}`}
      >
        {part?.given}
        <span className="absolute right-3">
          <PartEnd part={part} />
        </span>
      </div>
    </div>
  );
}
