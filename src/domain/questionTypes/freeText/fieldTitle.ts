import { subQuestionLetter } from "./subQuestionLetter";

// A sub-question's title on the phones and the TV: its letter, then its label ("a) Artist"), or
// "Delfråga a)", as the editor heads it, when the hosts left the label blank.
export function fieldTitle(labels: string[], index: number): string {
  const label = labels[index]?.trim() ?? "";
  return label === "" ? `Delfråga ${subQuestionLetter(index)})` : `${subQuestionLetter(index)}) ${label}`;
}
