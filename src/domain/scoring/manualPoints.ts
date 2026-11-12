// Points the hosts give by hand are kept to two decimals, as the scores show them (D43, D61).
export const roundPoints = (points: number) => Math.round(points * 100) / 100;

// A team's points given by hand, for an activity or a drawing: from 0 up to the question's most,
// when it has one (D61, D62).
export function isHandPoints(points: number, maxPoints: number | null): boolean {
  return Number.isFinite(points) && points >= 0 && (maxPoints === null || points <= maxPoints);
}

// A correction adds or takes away points; nothing is no correction.
export function isCorrection(points: number): boolean {
  return Number.isFinite(points) && roundPoints(points) !== 0;
}
