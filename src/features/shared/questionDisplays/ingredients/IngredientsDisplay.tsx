import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The teams write their guesses, so the question needs nothing beyond its prompt on the TV.
export function IngredientsQuestion() {
  return null;
}

// The ingredients, numbered, two columns when there are many.
export function IngredientsAnswer({ revealed }: RevealedDisplayProps<"ingredients">) {
  return (
    <ol className={`grid gap-[0.8cqw] ${revealed.items.length > 5 ? "grid-cols-2" : "grid-cols-1"}`}>
      {revealed.items.map((item, index) => (
        <li key={index} className="flex items-center gap-[1.4cqw] rounded-[1cqw] bg-card px-[1.6cqw] py-[0.8cqw] text-[2.4cqw] font-semibold">
          <span className="w-[2.4cqw] text-primary tabular-nums">{index + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  );
}
