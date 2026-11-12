// Every row is this tall with this gap, so the lines between the lists follow from the row numbers
// alone, with nothing to measure; shared by the input and the team's result (D59).
export const ROW_HEIGHT = 64;
export const ROW_GAP = 12;
export const LINES_WIDTH = 40;

const middleOf = (row: number) => row * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;

// The height of the two lists side by side.
export const listsHeight = (rows: number) => rows * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;

// A Bézier S-curve from a left row to a right row, leaving and arriving level, like the
// wireframe's lines; its ends reach just inside the rows' borders.
export function curveBetween(leftRow: number, rightRow: number): string {
  const [fromX, toX, midX] = [-2, LINES_WIDTH + 2, LINES_WIDTH / 2];
  const [fromY, toY] = [middleOf(leftRow), middleOf(rightRow)];
  return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
}
