// Written as `> 0` rather than `<= 0` checks elsewhere, so NaN counts as not positive.
export function isPositive(value: number): boolean {
  return value > 0;
}
