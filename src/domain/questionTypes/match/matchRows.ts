export type RowByLeft = (number | null)[];
export type Selection = { side: "left" | "right"; index: number } | null;

// The phone pairs rows, left row i with right row j, while the answer keeps only texts (D47):
// this puts each text back in its row, taking the first free row for a repeated text, such as
// after a reload.
export function rowsOfAnswer(rightByLeft: (string | null)[], right: string[]): RowByLeft {
  const used = new Set<number>();
  return rightByLeft.map((text) => {
    if (text === null) return null;
    const row = right.findIndex((candidate, index) => candidate === text && !used.has(index));
    if (row === -1) return null;
    used.add(row);
    return row;
  });
}

// The answer's texts for the rows joined.
export function textsOfRows(rowByLeft: RowByLeft, right: string[]): (string | null)[] {
  return rowByLeft.map((row) => (row === null ? null : right[row]));
}

// The left row a right row is joined to, or -1.
export function leftOfRight(rowByLeft: RowByLeft, right: number): number {
  return rowByLeft.indexOf(right);
}

// Joins left row `left` with right row `right`, taking that right row from any other left row;
// the same rows when they were joined already, so nothing is saved for an unchanged answer.
function join(rowByLeft: RowByLeft, left: number, right: number): RowByLeft {
  if (rowByLeft[left] === right) return rowByLeft;
  return rowByLeft.map((row, index) => (index === left ? right : row === right ? null : row));
}

// One tap on a row: a row on the other side from the selected one joins it; a paired row comes
// apart; any other row is selected, or unselected on a second tap.
export function tapRow(rowByLeft: RowByLeft, selection: Selection, tapped: NonNullable<Selection>): { rowByLeft: RowByLeft; selection: Selection } {
  if (selection !== null && selection.side !== tapped.side) {
    const left = tapped.side === "left" ? tapped.index : selection.index;
    const right = tapped.side === "right" ? tapped.index : selection.index;
    return { rowByLeft: join(rowByLeft, left, right), selection: null };
  }
  const pairedLeft = tapped.side === "left" ? (rowByLeft[tapped.index] !== null ? tapped.index : -1) : leftOfRight(rowByLeft, tapped.index);
  if (pairedLeft !== -1) {
    return { rowByLeft: rowByLeft.map((row, index) => (index === pairedLeft ? null : row)), selection: null };
  }
  const isSame = selection?.side === tapped.side && selection.index === tapped.index;
  return { rowByLeft, selection: isSame ? null : tapped };
}
