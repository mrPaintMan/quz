// Points for `count` right answers; null while the points per answer aren't filled in.
export function multiplyPoints(count: number, points: number | null): number | null {
  return points === null ? null : count * points;
}
