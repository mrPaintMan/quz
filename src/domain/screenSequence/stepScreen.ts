import type { Screen } from "@convex/games/screen";
import { findScreenIndex } from "@/domain/screenSequence/findScreenIndex";

export type ScreenPosition = { screen: Screen; screenIndex: number };

// One screen forward (1) or back (-1), staying put at either end.
export function stepScreen(sequence: Screen[], position: ScreenPosition, step: 1 | -1): ScreenPosition {
  const from = findScreenIndex(sequence, position.screen, position.screenIndex);
  const screenIndex = Math.min(Math.max(from + step, 0), sequence.length - 1);
  return { screen: sequence[screenIndex], screenIndex };
}
