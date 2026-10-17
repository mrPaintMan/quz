import { isBlank } from "@/domain/questionTypes/isBlank";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// Blank values are ignored: they are reported as missing text instead.
export function hasDuplicates(values: string[]): boolean {
  const normalized = values.filter((value) => !isBlank(value)).map(normalizeForComparison);
  return new Set(normalized).size < normalized.length;
}
