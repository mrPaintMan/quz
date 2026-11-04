export type Ranked<T> = T & { rank: number };

// Most points first; teams on the same points share a place (1, 2, 2, 4) and keep the order they
// came in, which is the order they joined.
export function rankTeams<T extends { points: number }>(teams: T[]): Ranked<T>[] {
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  return sorted.map((team) => ({ ...team, rank: sorted.findIndex((other) => other.points === team.points) + 1 }));
}
