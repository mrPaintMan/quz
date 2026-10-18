export type DragMove = { fromIndex: number; toIndex: number };

// Turns "item activeId was dropped on overId" into list indices, or null when nothing moves.
export function findDragMove(ids: readonly string[], activeId: string, overId: string | null): DragMove | null {
  if (overId === null || activeId === overId) return null;
  const fromIndex = ids.indexOf(activeId);
  const toIndex = ids.indexOf(overId);
  if (fromIndex === -1 || toIndex === -1) return null;
  return { fromIndex, toIndex };
}
