const LETTERS = "abc";

// The letter a sub-question goes by in the editor, its problems, the phones and the TV ("a", "b",
// "c"); a number beyond the letters, which a free-text question never reaches.
export function subQuestionLetter(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}
