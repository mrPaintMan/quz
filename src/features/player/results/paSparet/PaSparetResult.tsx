import { brakePointsOf } from "@/domain/questionTypes/paSparet/paSparetAnswering";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, ResultNote, resultClass } from "@/features/player/results/resultLook";

// The team's guess as it wrote it, with the points it braked at: lit with them when right, as sent
// when wrong, waiting while it is judged; a guess never braked scores nothing (D63).
export function PaSparetResult({ answer, outcome }: ResultViewProps<"paSparet">) {
  const part = outcome.parts[0];
  const brakePoints = brakePointsOf(answer.brakeClueIndex);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Ert resmål</p>
      <div key={part?.result} style={glowDelay(0)} className={`flex min-h-13 items-center gap-3 rounded-md border bg-card px-3 py-1.5 text-lg ${resultClass(part?.result)}`}>
        <span className="flex min-w-0 flex-1 flex-col break-words">
          {answer.guess}
          <ResultNote result={part?.result} />
        </span>
        <PartEnd part={part} />
      </div>
      <p className="text-muted-foreground">{brakePoints === null ? "Ni bromsade inte." : `Bromsade vid ${formatPoints(brakePoints)}`}</p>
    </div>
  );
}
