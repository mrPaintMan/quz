import type { OutcomePart } from "@/domain/answering/outcome";

// The part each of an answer's texts counted as, by the place grading recorded for it (`at`);
// blanks and repeats of an earlier text have none.
export function partsOfTexts(count: number, parts: OutcomePart[]): (OutcomePart | undefined)[] {
  return Array.from({ length: count }, (_, index) => parts.find((part) => part.at === index));
}
