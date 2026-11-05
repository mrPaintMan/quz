import { formatDecimal } from "@/domain/text/formatDecimal";
import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The teams type their guess, so the question needs nothing beyond its prompt on the TV.
export function NumberQuestion() {
  return null;
}

// The right number, large, on the answer screen.
export function NumberAnswer({ revealed }: RevealedDisplayProps<"number">) {
  if (revealed.answer === null) return null;
  return (
    <p className="flex flex-1 items-center justify-center text-[12cqw] leading-none font-bold text-primary tabular-nums">
      {formatDecimal(revealed.answer)}
    </p>
  );
}
