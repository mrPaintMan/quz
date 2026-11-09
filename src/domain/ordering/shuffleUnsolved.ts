import { shuffleStably } from "./shuffleStably";

// Texts shuffled for a question whose right order is `inRightOrder`: started from their
// alphabetical order and seeded by it, so the result says nothing about the right order (the
// phone runs the same shuffle, and could work the order back out of anything made from it). The
// same on every phone, the TV and after a reload. Should the shuffle land on the right order
// (1 in 120 for five texts), the first text moves last so the question is never shown solved;
// only then does the order shown hint at the answer (D46).
export function shuffleUnsolved(inRightOrder: readonly string[]): string[] {
  const alphabetical = [...inRightOrder].sort();
  const shuffled = shuffleStably(alphabetical, alphabetical.join("\n"));
  const isSolved = shuffled.every((text, index) => text === inRightOrder[index]);
  return isSolved && inRightOrder.length > 1 ? [...shuffled.slice(1), shuffled[0]] : shuffled;
}
