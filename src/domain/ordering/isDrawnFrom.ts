// Whether every chosen text is one of the texts on offer, each used no more times than offered,
// so a team can only send texts it was shown.
export function isDrawnFrom(chosen: readonly string[], offered: readonly string[]): boolean {
  const left = new Map<string, number>();
  for (const text of offered) left.set(text, (left.get(text) ?? 0) + 1);
  for (const text of chosen) {
    const count = left.get(text) ?? 0;
    if (count === 0) return false;
    left.set(text, count - 1);
  }
  return true;
}
