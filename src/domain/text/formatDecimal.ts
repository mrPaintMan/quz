// The inverse of parseDecimal for showing a stored number in an input.
export function formatDecimal(value: number | null): string {
  return value === null || Number.isNaN(value) ? "" : String(value).replace(".", ",");
}
