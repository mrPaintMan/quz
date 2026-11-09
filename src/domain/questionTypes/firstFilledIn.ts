import { isBlank } from "./isBlank";

// The first answer or spelling the hosts filled in, trimmed, as the TV shows it on the answer
// screen; empty when there is none.
export function firstFilledIn(texts: string[]): string {
  return texts.find((text) => !isBlank(text))?.trim() ?? "";
}
