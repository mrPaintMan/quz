// Whether a stored value holds NaN anywhere, however deeply nested.
export function containsNaN(value: unknown): boolean {
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.some(containsNaN);
  if (value !== null && typeof value === "object") return Object.values(value).some(containsNaN);
  return false;
}
