// How two texts are compared wherever the app asks whether they are the same: grading typed
// answers against their spellings, and the editor's and team names' duplicate checks, so the two
// can never disagree (D48). Case, spaces at the ends, doubled spaces and a full stop or comma at
// the end don't count; near misses are left to the AI judge (D50).
export function normalizeForComparison(text: string): string {
  // NFC first, so an accent typed as one letter and one pasted as a letter plus a mark are equal.
  return text
    .normalize("NFC")
    .toLocaleLowerCase("sv")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,]+$/, "")
    .trim();
}
