const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatSavedAgo(savedAt: number, now: number): string {
  const elapsed = Math.max(0, now - savedAt);
  if (elapsed < MINUTE) return "Sparat just nu";
  if (elapsed < HOUR) return `Sparat för ${Math.floor(elapsed / MINUTE)} min sedan`;
  if (elapsed < DAY) return `Sparat för ${Math.floor(elapsed / HOUR)} h sedan`;
  const days = Math.floor(elapsed / DAY);
  return `Sparat för ${days} ${days === 1 ? "dag" : "dagar"} sedan`;
}
