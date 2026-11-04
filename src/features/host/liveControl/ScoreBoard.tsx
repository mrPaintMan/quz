import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { TeamDot } from "@/features/shared/teams/TeamDot";

// The leaderboard as it stands, for the hosts all evening; the TV shows it between rounds.
export function ScoreBoard({ scores }: { scores: TeamScore[] }) {
  if (scores.length === 0) return null;
  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <h2 className="mb-1 font-semibold">Topplista</h2>
      <ol className="flex flex-col">
        {scores.map((team) => (
          <li key={team._id} className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
            <span className="w-5 text-sm text-muted-foreground tabular-nums">{team.rank}</span>
            <TeamDot colour={team.colour} />
            <span className="min-w-0 flex-1 truncate">{team.name}</span>
            <span className="font-semibold tabular-nums">{formatPoints(team.points)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
