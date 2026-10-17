import { parseLines } from "@/domain/text/parseLines";

export type AnswerKeyItem = { spellings: string[] };

// One item per line, alternative spellings separated by "/": "Köpenhamn / København".
export function parseAnswerKey(text: string): AnswerKeyItem[] {
  return parseLines(text).map((line) => ({
    spellings: line
      .split("/")
      .map((spelling) => spelling.trim())
      .filter((spelling) => spelling !== ""),
  }));
}
