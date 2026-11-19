import { optionLetter } from "@/domain/questionTypes/multipleChoice/optionLetter";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PointsBadge, WrongMark } from "@/features/player/results/resultLook";

// The options as the team saw them; its pick lights up in gold with its points when right, or keeps
// its look with a red ✕ when wrong, and then the right option is outlined in gold (D59, D67).
export function MultipleChoiceResult({ shown, answer, outcome, imageUrls, revealed }: ResultViewProps<"multipleChoice">) {
  const part = outcome.parts[0];
  const isRight = part?.result === "right";
  const correctIndex = revealed?.correctIndex ?? null;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-1 text-sm text-muted-foreground">Välj ett alternativ</p>
      {shown.options.map((option, index) => {
        const isPicked = answer.optionIndex === index;
        const imageUrl = option.imageId === null ? undefined : imageUrls[option.imageId];
        const isCorrect = !isRight && index === correctIndex;
        const look = isPicked && isRight ? "result-lit border" : isCorrect ? "border-2 border-primary bg-card" : "border bg-card";
        return (
          <div
            // A new key replays the glow when the result changes.
            key={isPicked ? `${index}-${part?.result}` : index}
            aria-label={[optionLetter(index), option.text, isPicked ? "ert svar" : ""].filter(Boolean).join(" ")}
            style={isPicked ? glowDelay(0) : undefined}
            className={`flex min-h-15 items-center gap-3.5 rounded-2xl px-4 py-2 text-lg ${look}`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-semibold ${isPicked && isRight ? "bg-black/15" : "bg-secondary"}`}
            >
              {optionLetter(index)}
            </span>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
              <img src={imageUrl} alt="" className="max-h-24 min-w-0 rounded-md object-contain" />
            )}
            <span className="min-w-0 flex-1">{option.text}</span>
            {isPicked && isRight && <PointsBadge points={part.points} />}
            {isPicked && !isRight && <WrongMark />}
            {isCorrect && <span className="shrink-0 text-sm text-primary">Rätt svar</span>}
          </div>
        );
      })}
    </div>
  );
}
