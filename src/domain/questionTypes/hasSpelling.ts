import { isBlank } from "./isBlank";

export function hasSpelling(spellings: string[]): boolean {
  return spellings.some((spelling) => !isBlank(spelling));
}
