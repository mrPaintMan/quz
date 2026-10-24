import type { Screen } from "@convex/games/screen";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";

// Where the game is in the sequence. If its screen is gone (its question was deleted during the
// game), the screen that took its place counts instead.
export function findScreenIndex(sequence: Screen[], current: Screen, savedIndex: number): number {
  const index = sequence.findIndex((screen) => isSameScreen(screen, current));
  return index === -1 ? Math.min(savedIndex, sequence.length - 1) : index;
}
