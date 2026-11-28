import type { Screen } from "@convex/games/screen";

// The same text for screens that show the same thing, whatever order their fields are in.
export const screenKey = (screen: Screen) => JSON.stringify(Object.entries(screen).sort(([a], [b]) => a.localeCompare(b)));

// Screens are equal when they show the same thing, whatever order their fields were stored in.
export function isSameScreen(a: Screen, b: Screen): boolean {
  return screenKey(a) === screenKey(b);
}
