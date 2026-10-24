import type { Screen } from "@convex/games/screen";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";

// Where the game is in the sequence. If its screen is gone (its question was deleted during the
// game), the screen that took its place counts instead; if that is an answer, its question
// counts, so the TV never reveals an answer before the question is asked.
export function findScreenIndex(sequence: Screen[], current: Screen, savedIndex: number): number {
  const index = sequence.findIndex((screen) => isSameScreen(screen, current));
  if (index !== -1) return index;
  const fallback = Math.min(savedIndex, sequence.length - 1);
  return sequence[fallback].kind === "answer" ? fallback - 1 : fallback;
}
