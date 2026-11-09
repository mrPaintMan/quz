import type { RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

const cardClass = "rounded-[1cqw] bg-card px-[1.6cqw] py-[0.8cqw] text-[2.2cqw] font-semibold";

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[0.8cqw]">
      <p className="text-[1.6cqw] text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-[0.8cqw]">
        {items.map((item, index) => (
          <li key={index} className={cardClass}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// The two lists side by side, the right one in the shuffled order the phones show.
export function MatchQuestion({ shown }: ShownDisplayProps<"match">) {
  return (
    <div className="flex gap-[4cqw]">
      <Column title="Lista A" items={shown.left} />
      <Column title="Lista B" items={shown.right} />
    </div>
  );
}

// The right pairs, one per row.
export function MatchAnswer({ revealed }: RevealedDisplayProps<"match">) {
  return (
    <ul className="flex flex-col gap-[0.8cqw]">
      {revealed.pairs.map((pair, index) => (
        <li key={index} className={`flex items-center gap-[2cqw] ${cardClass}`}>
          <span className="min-w-0 flex-1">{pair.left}</span>
          <span aria-hidden="true" className="text-primary">
            —
          </span>
          <span className="min-w-0 flex-1">{pair.right}</span>
        </li>
      ))}
    </ul>
  );
}
