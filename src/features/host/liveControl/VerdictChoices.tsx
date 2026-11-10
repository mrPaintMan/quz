import { Button } from "@/components/ui/button";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import type { Target } from "@/domain/review/typedReview";

// Up to this many accepted answers get a button each; a longer key is picked from a list.
const MAX_BUTTONS = 5;

type Slot = { options: string[]; isOpen: boolean; names: string[] };
type Item = { written: string; isJudged: boolean; target: Target };

// How the hosts judge one text: Rätt (or which accepted answer it counts as) or Fel. In a list,
// Rätt counts it as an item of its own, and "Samma som …" as a key item or an item already named,
// so two forms of one answer score once (D53).
export function VerdictChoices({ slot, item, onChoose }: { slot: Slot; item: Item; onChoose: (target: Target) => void }) {
  const isChosen = (target: Target) => item.isJudged && item.target === target;
  const wrong = (
    <Button size="sm" variant={isChosen(null) ? "default" : "outline"} aria-pressed={isChosen(null)} onClick={() => onChoose(null)}>
      Fel
    </Button>
  );
  if (!slot.isOpen && slot.options.length <= MAX_BUTTONS) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {slot.options.map((label, target) => (
          <Button key={target} size="sm" variant={isChosen(target) ? "default" : "outline"} aria-pressed={isChosen(target)} onClick={() => onChoose(target)}>
            {slot.options.length === 1 ? "Rätt" : label}
          </Button>
        ))}
        {wrong}
      </div>
    );
  }

  const own = normalizeForComparison(item.written);
  const isOwn = item.isJudged && typeof item.target === "string" && normalizeForComparison(item.target) === own;
  const choices = [
    ...slot.options.map((label, index) => ({ value: `#${index}`, label, target: index as Target })),
    ...slot.names.filter((name) => normalizeForComparison(name) !== own).map((name) => ({ value: `=${name}`, label: name, target: name as Target })),
  ];
  const isTarget = (target: Target) =>
    typeof target === "string" && typeof item.target === "string" ? normalizeForComparison(target) === normalizeForComparison(item.target) : target === item.target;
  const chosen = item.isJudged && !isOwn ? choices.find((choice) => isTarget(choice.target))?.value : undefined;
  const prompt = slot.isOpen ? "Samma som…" : "Rätt som…";

  return (
    <div className="flex flex-wrap gap-1.5">
      {slot.isOpen && (
        <Button size="sm" variant={isOwn ? "default" : "outline"} aria-pressed={isOwn} onClick={() => onChoose(item.written)}>
          Rätt
        </Button>
      )}
      {choices.length > 0 && (
        <select
          aria-label={prompt}
          value={chosen ?? ""}
          onChange={(event) => {
            const choice = choices.find((candidate) => candidate.value === event.target.value);
            if (choice) onChoose(choice.target);
          }}
          className={`h-8 max-w-44 rounded-lg border pl-2.5 pr-8 text-sm ${chosen ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}
        >
          <option value="" disabled>
            {prompt}
          </option>
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      )}
      {wrong}
    </div>
  );
}
