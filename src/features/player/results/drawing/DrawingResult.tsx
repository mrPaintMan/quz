import { DrawingPicture } from "@/features/shared/drawing/DrawingPicture";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, ResultNote, resultClass } from "@/features/player/results/resultLook";

// The team's own drawing as sent: dashed with "Bedöms…" while the hosts score it, then lit in gold
// with its points when it scored (D62).
export function DrawingResult({ answer, outcome }: ResultViewProps<"drawing">) {
  const part = outcome.parts[0];
  return (
    <div key={part?.result} style={glowDelay(0)} className={`flex flex-col gap-2 rounded-2xl border bg-card p-2 ${resultClass(part?.result)}`}>
      <DrawingPicture strokes={answer.strokes} label="Er teckning" className="w-full rounded-xl" />
      <div className="flex items-center gap-3 px-2 pb-1 text-lg">
        <span className="flex min-w-0 flex-1 flex-col">
          Er teckning
          <ResultNote result={part?.result} />
        </span>
        <PartEnd part={part} />
      </div>
    </div>
  );
}
