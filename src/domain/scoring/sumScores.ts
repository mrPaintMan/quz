import { rankTeams, type Ranked } from "./rankTeams";

type Points = { teamId: string; points: number };

// Rounded to hundredths, so sums of decimal points (0,1 + 0,2) show and compare as written.
const roundPoints = (points: number) => Math.round(points * 100) / 100;

// Each team's score: its graded answers plus the hosts' points, ranked (D6, D43). Every team is
// listed, on 0 before anything has scored.
export function sumScores<T extends { _id: string }>(teams: T[], earned: Points[]): Ranked<T & { points: number }>[] {
  const totals = new Map<string, number>();
  for (const { teamId, points } of earned) totals.set(teamId, (totals.get(teamId) ?? 0) + points);
  return rankTeams(teams.map((team) => ({ ...team, points: roundPoints(totals.get(team._id) ?? 0) })));
}
