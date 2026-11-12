import { optionLetter } from "@/domain/questionTypes/multipleChoice/optionLetter";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PointsBadge } from "@/features/player/results/resultLook";

// The options as the team saw them; its pick lights up in gold with its points when right, or in
// red when wrong, so the team sees what it answered. The right option is the TV's to show (D59).
export function MultipleChoiceResult({ shown, answer, outcome, imageUrls }: ResultViewProps<"multipleChoice">) {
  const part = outcome.parts[0];
  const isRight = part?.result === "right";
  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-1 text-sm text-muted-foreground">Välj ett alternativ</p>
      {shown.options.map((option, index) => {
        const isPicked = answer.optionIndex === index;
        const imageUrl = option.imageId === null ? undefined : imageUrls[option.imageId];
        const look = !isPicked ? "border bg-card" : isRight ? "result-lit border" : "result-missed border-2";
        return (
          <div
            // A new key replays the glow when the result changes.
            key={isPicked ? `${index}-${part?.result}` : index}
            aria-label={[optionLetter(index), option.text, isPicked ? "ert svar" : ""].filter(Boolean).join(" ")}
            style={isPicked ? glowDelay(0) : undefined}
            className={`flex min-h-15 items-center gap-3.5 rounded-2xl px-4 py-2 text-lg ${look}`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-semibold ${!isPicked ? "bg-secondary" : isRight ? "bg-black/15" : "bg-destructive text-background"}`}
            >
              {optionLetter(index)}
            </span>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
              <img src={imageUrl} alt="" className="max-h-24 min-w-0 rounded-md object-contain" />
            )}
            <span className="min-w-0 flex-1">{option.text}</span>
            {isPicked && isRight && <PointsBadge points={part.points} />}
            {isPicked && !isRight && (
              <span className="shrink-0 rounded-full bg-background px-2.5 py-0.5 text-sm font-bold whitespace-nowrap text-destructive">Ert svar · 0 p</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
