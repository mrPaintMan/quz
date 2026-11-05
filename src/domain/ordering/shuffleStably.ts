// A number from a text, the same every time (FNV-1a), to seed the shuffle.
function hashText(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// A small seeded random generator (mulberry32): the same seed gives the same sequence.
function randomFrom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

// The items shuffled the same way every time for the same items, so every phone, the TV and a
// reloaded page show one order. Never the order given, so a sort question is never pre-solved.
export function shuffleStably<T>(items: readonly T[], seedText: string): T[] {
  const random = randomFrom(hashText(seedText));
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  const isUnchanged = shuffled.every((item, index) => item === items[index]);
  return isUnchanged && items.length > 1 ? [...items.slice(1), items[0]] : shuffled;
}
