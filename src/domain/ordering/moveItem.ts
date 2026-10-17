// Returns a new array with the item at fromIndex moved to toIndex (clamped to the array).
export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  const target = Math.min(Math.max(toIndex, 0), result.length);
  result.splice(target, 0, moved);
  return result;
}
