export function normalizeForComparison(text: string): string {
  return text.trim().toLocaleLowerCase("sv");
}
