// The phone pairs rows: left row i with right row j. The answer keeps only texts (D47), so a
// repeated right-hand text is matched to its rows here.

export type RowByLeft = (number | null)[];
export type Selection = { side: "left" | "right"; index: number } | null;

// The right row each left item's text sits in, taking the first free row for a repeated text,
// such as after a reload.
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

// Joins left row `left` with right row `right`, taking that right row from any other left row.
function join(rowByLeft: RowByLeft, left: number, right: number): RowByLeft {
  return rowByLeft.map((row, index) => (index === left ? right : row === right ? null : row));
}

// One tap on a row: a paired row with nothing selected comes apart; a row on the other side from
// the selected one joins it; any other tap selects the row, or unselects it.
export function tapRow(rowByLeft: RowByLeft, selection: Selection, tapped: NonNullable<Selection>): { rowByLeft: RowByLeft; selection: Selection } {
  const leftOfRight = (row: number) => rowByLeft.indexOf(row);
  if (selection !== null && selection.side !== tapped.side) {
    const left = tapped.side === "left" ? tapped.index : selection.index;
    const right = tapped.side === "right" ? tapped.index : selection.index;
    return { rowByLeft: join(rowByLeft, left, right), selection: null };
  }
  const isSame = selection?.side === tapped.side && selection.index === tapped.index;
  const pairedLeft = tapped.side === "left" ? (rowByLeft[tapped.index] !== null ? tapped.index : -1) : leftOfRight(tapped.index);
  if (selection === null && pairedLeft !== -1) {
    return { rowByLeft: rowByLeft.map((row, index) => (index === pairedLeft ? null : row)), selection: null };
  }
  return { rowByLeft, selection: isSame ? null : tapped };
}
