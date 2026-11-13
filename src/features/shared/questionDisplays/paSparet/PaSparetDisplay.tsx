import { formatPoints } from "@/domain/scoring/formatPoints";
import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { TeamDot } from "@/features/shared/teams/TeamDot";

// The film and its points carry the trip, so the question needs nothing more (D40).
export function PaSparetQuestion() {
  return null;
}

// The destination, and every team's guess with the points it braked at, most points first; a
// right guess lights up with what it scored (D63).
export function PaSparetAnswer({ revealed }: RevealedDisplayProps<"paSparet">) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[1.6cqw]">
      <p className="text-[4.5cqw] font-bold text-primary">{revealed.destination}</p>
      {revealed.guesses.length > 0 && (
        <ol className="grid grid-cols-2 gap-x-[3cqw] gap-y-[0.8cqw] text-[1.9cqw]">
          {revealed.guesses.map((guess) => (
            <li key={guess.teamId} className={`flex items-center gap-[1cqw] rounded-[0.8cqw] px-[1cqw] py-[0.4cqw] ${guess.result === "right" ? "bg-primary/15" : ""}`}>
              <TeamDot colour={guess.colour} className="size-[1.5cqw]" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{guess.name}</span>
                <span className="truncate text-[1.5cqw] text-muted-foreground">
                  {guess.brakePoints === null ? "Bromsade inte" : `${guess.guess} · bromsade vid ${formatPoints(guess.brakePoints)}`}
                </span>
              </span>
              {guess.result === "right" && <span className="font-semibold text-primary">+{formatPoints(guess.points)}</span>}
              {guess.result === "pending" && <span className="text-[1.5cqw] text-muted-foreground">Bedöms…</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
