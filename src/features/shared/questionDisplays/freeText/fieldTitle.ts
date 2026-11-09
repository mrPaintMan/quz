const LETTERS = "abc";

// A sub-question's title, as in the editor: its letter, then its label ("a) Artist"), or
// "Delfråga a)" when the hosts left the label blank.
export function fieldTitle(labels: string[], index: number): string {
  const letter = LETTERS[index] ?? String(index + 1);
  const label = labels[index]?.trim() ?? "";
  return label === "" ? `Delfråga ${letter})` : `${letter}) ${label}`;
}
