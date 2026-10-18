// The best score on offer; null while any of the points isn't filled in.
export function highestPoints(points: (number | null)[]): number | null {
  const filledIn = points.filter((value): value is number => value !== null);
  return filledIn.length < points.length ? null : Math.max(0, ...filledIn);
}
