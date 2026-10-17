import type { AnswerKeyItem } from "@/domain/text/parseAnswerKey";

// The inverse of parseAnswerKey, for showing a stored answer key in a text box.
export function formatAnswerKey(items: AnswerKeyItem[]): string {
  return items.map((item) => item.spellings.join(" / ")).join("\n");
}
