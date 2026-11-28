import { formatPoints } from "@/domain/scoring/formatPoints";
import { PineBed } from "@/features/shared/julquiz/TvDecor";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { TvFrame } from "./TvFrame";

// More teams than this go in two columns, so all twelve fit the stage.
const ONE_COLUMN_MAX = 6;

// The teams by score, with shared places for equal points (D6); counts only answered questions
// whose answer is out (D41).
// While the scores load the list is left out, rather than claiming no team has joined.
// On a Julquiz the list lies in a box of its own on a bed of pine (D75).
export function LeaderboardScreen({ title, scores, isChristmas = false }: { title: string; scores: TeamScore[] | undefined; isChristmas?: boolean }) {
  if (scores === undefined) return <TvFrame title={title} titleCentered />;
  const columns = scores.length > ONE_COLUMN_MAX ? "grid-cols-2" : "grid-cols-1";
  return (
    <TvFrame title={title} titleCentered>
      {scores.length === 0 ? (
        <p className="text-[2cqw] text-muted-foreground">Inga lag har anmält sig.</p>
      ) : (
        <div className={isChristmas ? `relative mx-auto rounded-[1.6cqw] bg-background p-[1.6cqw] ${columns === "grid-cols-1" ? "w-[62cqw]" : "w-[82cqw]"}` : "contents"}>
          {isChristmas && <PineBed />}
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
        </div>
      )}
    </TvFrame>
  );
}
