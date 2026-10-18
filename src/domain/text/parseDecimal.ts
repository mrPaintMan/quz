// Accepts Swedish decimal commas ("0,5"). Empty or invalid input gives null,
// which the question rules report as missing (D28).
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  const value = Number(normalized);
  return normalized === "" || !Number.isFinite(value) ? null : value;
}
