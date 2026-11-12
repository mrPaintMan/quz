import type { OutcomePart } from "@/domain/answering/outcome";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// The part each text of an answer counted as, by its place: grading takes the written texts in
// order, leaving out blanks and an exact repeat of an earlier text (D53), so those get none.
export function partsOfTexts(texts: string[], parts: OutcomePart[]): (OutcomePart | undefined)[] {
  const seen = new Set<string>();
  let next = 0;
  return texts.map((text) => {
    const normalized = normalizeForComparison(text);
    if (normalized === "" || seen.has(normalized)) return undefined;
    seen.add(normalized);
    return parts[next++];
  });
}
