import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// One group a typed text is judged in, such as a free-text field or all of an ingredients
// question's fields together. Its options are the accepted answers a text there may count as;
// a verdict names one by its place (D51).
export type ReviewSlot = { title: string; options: { label: string; spellings: string[] }[] };

// The hosts' decision on a text written in a slot, compared as normalized: the option it counts
// as, or null for wrong. Shared by every team that wrote the same text there.
export type Verdict = { slot: number; text: string; target: number | null };

// A text that matched no accepted spelling exactly, with how it was first written and how many
// teams wrote it, for the hosts to judge once.
export type ReviewItem = { slot: number; text: string; written: string; teamCount: number };

// How a type with typed answers is judged: its slots, the texts an answer holds and the points
// each distinct option matched scores.
export type TypedReview<Content, Answer> = {
  slots: (content: Content) => ReviewSlot[];
  texts: (answer: Answer) => { slot: number; text: string }[];
  pointsPerMatch: (content: Content) => number;
};

const keyOf = (slot: number, text: string) => JSON.stringify([slot, text]);

// The option each normalized spelling of each slot names; the first option wins a shared spelling.
function exactMatches(slots: ReviewSlot[]) {
  const exact = new Map<string, number>();
  slots.forEach((slot, slotIndex) =>
    slot.options.forEach((option, optionIndex) =>
      option.spellings.map(normalizeForComparison).forEach((spelling) => {
        const key = keyOf(slotIndex, spelling);
        if (spelling !== "" && !exact.has(key)) exact.set(key, optionIndex);
      }),
    ),
  );
  return exact;
}

// The non-blank texts of an answer in slots that exist, normalized, each once as first written.
function writtenTexts<Content, Answer>(review: TypedReview<Content, Answer>, slotCount: number, answer: Answer) {
  const texts = new Map<string, { slot: number; text: string; written: string }>();
  for (const { slot, text } of review.texts(answer)) {
    const normalized = normalizeForComparison(text);
    const key = keyOf(slot, normalized);
    if (normalized !== "" && slot < slotCount && !texts.has(key)) texts.set(key, { slot, text: normalized, written: text.trim() });
  }
  return [...texts.entries()];
}

// Each answer's points: every distinct option its texts count as, by an exact spelling or else
// by the hosts' verdict, scores the points per match. Unjudged texts score nothing.
export function gradeTyped<Content, Answer>(
  review: TypedReview<Content, Answer>,
  content: Content,
  answers: Answer[],
  verdicts: Verdict[],
): number[] {
  const slots = review.slots(content);
  const exact = exactMatches(slots);
  const judged = new Map(verdicts.map((verdict) => [keyOf(verdict.slot, verdict.text), verdict.target]));
  return answers.map((answer) => {
    const matched = new Set<string>();
    for (const [key, { slot }] of writtenTexts(review, slots.length, answer)) {
      const target = exact.get(key) ?? judged.get(key) ?? null;
      if (target !== null && target < slots[slot].options.length) matched.add(keyOf(slot, String(target)));
    }
    return matched.size * review.pointsPerMatch(content);
  });
}

// The texts no accepted spelling matches exactly, each once per slot with how many teams wrote
// it, in slot and then alphabetical order so the hosts' list doesn't jump as verdicts come in.
export function textsToReview<Content, Answer>(review: TypedReview<Content, Answer>, content: Content, answers: Answer[]): ReviewItem[] {
  const slots = review.slots(content);
  const exact = exactMatches(slots);
  const items = new Map<string, ReviewItem>();
  for (const answer of answers) {
    for (const [key, text] of writtenTexts(review, slots.length, answer)) {
      if (exact.has(key)) continue;
      const item = items.get(key);
      if (item) item.teamCount += 1;
      else items.set(key, { ...text, teamCount: 1 });
    }
  }
  return [...items.values()].sort((a, b) => a.slot - b.slot || a.text.localeCompare(b.text, "sv"));
}
