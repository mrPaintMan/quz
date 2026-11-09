import { isBlank } from "@/domain/questionTypes/isBlank";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// Values with nothing left once compared (blank, or only a full stop) are ignored: they are
// reported as missing text instead.
export function hasDuplicates(values: string[]): boolean {
  const normalized = values.map(normalizeForComparison).filter((value) => !isBlank(value));
  return new Set(normalized).size < normalized.length;
}
