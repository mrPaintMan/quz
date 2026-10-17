// Accepts Swedish decimal commas ("0,5"). Empty or invalid input gives NaN,
// which the question rules report as missing.
export function parseDecimal(text: string): number {
  const normalized = text.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}
