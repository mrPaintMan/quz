import type { Screen } from "@convex/games/screen";

const keyOf = (screen: Screen) => JSON.stringify(Object.entries(screen).sort(([a], [b]) => a.localeCompare(b)));

// Screens are equal when they show the same thing, whatever order their fields were stored in.
export function isSameScreen(a: Screen, b: Screen): boolean {
  return keyOf(a) === keyOf(b);
}
