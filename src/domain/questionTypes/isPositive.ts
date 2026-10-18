// An empty field (null) is not positive; written as `> 0` so a stray NaN isn't either.
export function isPositive(value: number | null): boolean {
  return value !== null && value > 0;
}
