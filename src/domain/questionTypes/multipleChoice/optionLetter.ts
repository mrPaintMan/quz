// The letter an option goes by on the TV and the phones: A, B, C …
export function optionLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}
