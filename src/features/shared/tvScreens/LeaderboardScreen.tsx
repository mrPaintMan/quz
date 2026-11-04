import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { TvFrame } from "./TvFrame";

// More teams than this go in two columns, so all twelve fit the stage.
const ONE_COLUMN_MAX = 6;

// The teams by score, with shared places for equal points (D6); counts only answered questions
// whose answer is out (D41).
export function LeaderboardScreen({ title, scores }: { title: string; scores: TeamScore[] }) {
  const columns = scores.length > ONE_COLUMN_MAX ? "grid-cols-2" : "grid-cols-1";
  return (
    <TvFrame title={title}>
      {scores.length === 0 ? (
        <p className="text-[2cqw] text-muted-foreground">Inga lag har anmält sig.</p>
      ) : (
        <ol className={`grid grid-flow-col gap-x-[4cqw] gap-y-[1cqw] ${columns}`} style={{ gridTemplateRows: `repeat(${Math.min(scores.length, ONE_COLUMN_MAX)}, auto)` }}>
          {scores.map((team) => (
            <li key={team._id} className="flex items-center gap-[1.4cqw] rounded-[1cqw] bg-card px-[1.6cqw] py-[0.8cqw] text-[2.4cqw]">
              <span className="w-[3cqw] text-muted-foreground tabular-nums">{team.rank}</span>
              <TeamDot colour={team.colour} className="size-[1.6cqw]" />
              <span className="min-w-0 flex-1 truncate font-semibold">{team.name}</span>
              <span className="font-bold tabular-nums">{formatPoints(team.points)}</span>
            </li>
          ))}
        </ol>
      )}
    </TvFrame>
  );
}
