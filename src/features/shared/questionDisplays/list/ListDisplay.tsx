import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The most items the answer screen has room for; the rest are counted.
const MAX_SHOWN = 40;

// The teams list their answers on their phones, so the question needs nothing beyond its prompt.
export function ListQuestion() {
  return null;
}

// Each item the teams got right, with how many teams got it, lit; then, dimmed, the key's items no
// team gave, up to twenty (D66). More columns the more there are. It fills in as the AI judge and
// the hosts give their verdicts (D53).
export function ListAnswer({ revealed }: RevealedDisplayProps<"list">) {
  const { items, others } = revealed;
  if (items.length === 0 && others.length === 0) {
    return <p className="flex flex-1 items-center justify-center text-[3cqw] text-muted-foreground">Inga rätta svar ännu.</p>;
  }
  const shown = items.slice(0, MAX_SHOWN);
  const shownOthers = others.slice(0, Math.max(MAX_SHOWN - shown.length, 0));
  const count = shown.length + shownOthers.length;
  const hidden = items.length + others.length - count;
  const columns = count > 24 ? "grid-cols-4" : count > 12 ? "grid-cols-3" : count > 6 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className="flex flex-col gap-[0.8cqw]">
      {items.length === 0 && <p className="text-[2cqw] text-muted-foreground">Inga rätta svar ännu.</p>}
      <ul className={`grid gap-[0.6cqw] ${columns}`}>
        {shown.map((item, index) => (
          <li key={index} className="flex items-baseline justify-between gap-[1cqw] rounded-[0.8cqw] bg-primary/15 px-[1.2cqw] py-[0.5cqw] text-[1.8cqw]">
            <span className="truncate font-semibold">{item.name}</span>
            <span className="shrink-0 text-[1.3cqw] text-muted-foreground">{item.teamCount} lag</span>
          </li>
        ))}
        {shownOthers.map((name, index) => (
          <li key={`other-${index}`} className="truncate rounded-[0.8cqw] bg-card px-[1.2cqw] py-[0.5cqw] text-[1.8cqw] text-muted-foreground">
            {name}
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="text-[1.6cqw] text-muted-foreground">och {hidden} till</p>}
    </div>
  );
}
