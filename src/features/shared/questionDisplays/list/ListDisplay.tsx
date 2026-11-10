import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The most items the answer screen has room for; the rest are counted.
const MAX_SHOWN = 40;

// The teams list their answers on their phones, so the question needs nothing beyond its prompt.
export function ListQuestion() {
  return null;
}

// Each item the teams got right, with how many teams got it, in more columns the more there are.
// It fills in as the AI judge and the hosts give their verdicts (D53).
export function ListAnswer({ revealed }: RevealedDisplayProps<"list">) {
  const { items } = revealed;
  if (items.length === 0) {
    return <p className="flex flex-1 items-center justify-center text-[3cqw] text-muted-foreground">Inga rätta svar ännu.</p>;
  }
  const shown = items.slice(0, MAX_SHOWN);
  const columns = shown.length > 24 ? "grid-cols-4" : shown.length > 12 ? "grid-cols-3" : shown.length > 6 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className="flex flex-col gap-[0.8cqw]">
      <ul className={`grid gap-[0.6cqw] ${columns}`}>
        {shown.map((item) => (
          <li key={item.name} className="flex items-baseline justify-between gap-[1cqw] rounded-[0.8cqw] bg-card px-[1.2cqw] py-[0.5cqw] text-[1.8cqw]">
            <span className="truncate font-semibold">{item.name}</span>
            <span className="shrink-0 text-[1.3cqw] text-muted-foreground">{item.teamCount} lag</span>
          </li>
        ))}
      </ul>
      {items.length > MAX_SHOWN && <p className="text-[1.6cqw] text-muted-foreground">och {items.length - MAX_SHOWN} till</p>}
    </div>
  );
}
