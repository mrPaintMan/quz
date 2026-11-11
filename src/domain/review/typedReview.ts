import type { Outcome, OutcomePart } from "@/domain/answering/outcome";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// One group a typed text is judged in, such as a free-text field or all of an ingredients
// question's fields together. Its options are the accepted answers a text there may count as;
// a verdict names one by its place (D51). In an open slot (a list, whose key may be incomplete) a
// right text may also count as an item outside the key, named by the verdict (D53). answer is the
// correct answer the hosts' box shows by a sub-question's title, when it has one (D56).
export type ReviewSlot = { title: string; options: { label: string; spellings: string[] }[]; isOpen?: boolean; answer?: string };

// What a verdict says a text counts as: an option by its place, an item outside the key by its
// name (open slots only), or null for wrong.
export type Target = number | string | null;

// The hosts' decision on a text written in a slot, compared as normalized. Shared by every team
// that wrote the same text there. byAi marks one the AI judge gave (D52).
export type Verdict = { slot: number; text: string; target: Target; byAi?: boolean };

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

// What ingredients and lists show of each text written: no label, nothing beside it (D58).
export function itemOutcomes<Content, Answer>(review: TypedReview<Content, Answer>, content: Content, answers: Answer[], verdicts: Verdict[]): Outcome[] {
  return textOutcomes(review, content, answers, verdicts).map(({ points, texts }) => ({
    points,
    parts: texts.map(({ written, result }) => ({ label: "", given: written, result, correct: "" })),
  }));
}

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

const canCount = (slot: ReviewSlot | undefined) => slot !== undefined && (slot.isOpen === true || slot.options.length > 0);

// The item a target counts as in its slot: a key no other item shares, and its name as shown. An
// option goes by its label; a name in an open slot by itself, unless it is one of the key's
// spellings, which makes it that option. null for wrong, or for a target that no longer fits.
function itemOf(slots: ReviewSlot[], exact: Map<string, number>, slot: number, target: Target) {
  const options = slots[slot]?.options ?? [];
  const option = typeof target === "string" ? exact.get(keyOf(slot, normalizeForComparison(target))) : target;
  if (typeof option === "number") {
    return option >= 0 && option < options.length ? { key: keyOf(slot, `#${option}`), name: options[option].label } : null;
  }
  if (typeof target !== "string" || !slots[slot]?.isOpen || normalizeForComparison(target) === "") return null;
  return { key: keyOf(slot, `=${normalizeForComparison(target)}`), name: target.trim() };
}

// The non-blank texts of an answer in slots that exist and can count something (an accepted answer,
// or open), normalized, each once as first written.
function writtenTexts<Content, Answer>(review: TypedReview<Content, Answer>, slots: ReviewSlot[], answer: Answer) {
  const texts = new Map<string, { slot: number; text: string; written: string }>();
  for (const { slot, text } of review.texts(answer)) {
    const normalized = normalizeForComparison(text);
    const key = keyOf(slot, normalized);
    if (normalized !== "" && canCount(slots[slot]) && !texts.has(key)) texts.set(key, { slot, text: normalized, written: text.trim() });
  }
  return [...texts.entries()];
}

// What each text of an answer counted as, in the order written: a distinct item, by an exact
// spelling or else by a verdict, is right and scores the points per match; another form of an item
// already counted is a repeat and adds nothing, so two forms of one answer score once (D53); a text
// without a verdict is pending and, like a wrong one, scores nothing (D58).
export function textOutcomes<Content, Answer>(
  review: TypedReview<Content, Answer>,
  content: Content,
  answers: Answer[],
  verdicts: Verdict[],
): { points: number; texts: TextOutcome[] }[] {
  const outcomesOf = matcher(review, content, verdicts);
  return answers.map((answer) => {
    const texts = outcomesOf(answer);
    const right = texts.filter((text) => text.result === "right").length;
    return { points: right * review.pointsPerMatch(content), texts };
  });
}

// One written text's outcome, with the name of the item it counted as when right or a repeat.
// key tells items apart, as two can share a name.
export type TextOutcome = { slot: number; written: string; result: OutcomePart["result"]; item: string; key: string };

// For a question and its verdicts: what each text of an answer counts as, in the order written.
function matcher<Content, Answer>(review: TypedReview<Content, Answer>, content: Content, verdicts: Verdict[]) {
  const slots = review.slots(content);
  const exact = exactMatches(slots);
  const judged = new Map(verdicts.map((verdict) => [keyOf(verdict.slot, verdict.text), verdict.target]));
  return (answer: Answer): TextOutcome[] => {
    const matched = new Set<string>();
    return writtenTexts(review, slots, answer).map(([key, { slot, written }]) => {
      const target = exact.get(key) ?? judged.get(key);
      if (target === undefined) return { slot, written, result: "pending", item: "", key: "" };
      const item = itemOf(slots, exact, slot, target);
      if (item === null) return { slot, written, result: "wrong", item: "", key: "" };
      const result = matched.has(item.key) ? "repeat" : "right";
      matched.add(item.key);
      return { slot, written, result, item: item.name, key: item.key };
    });
  };
}

// Each item the teams got right, once, with how many teams got it, most often first, for the
// answer screen of a list (D53).
export function rightItems<Content, Answer>(
  review: TypedReview<Content, Answer>,
  content: Content,
  answers: Answer[],
  verdicts: Verdict[],
): { name: string; teamCount: number }[] {
  const outcomesOf = matcher(review, content, verdicts);
  const items = new Map<string, { name: string; teamCount: number }>();
  for (const answer of answers) {
    for (const { item: name, result, key } of outcomesOf(answer)) {
      if (result !== "right") continue;
      const item = items.get(key);
      if (item) item.teamCount += 1;
      else items.set(key, { name, teamCount: 1 });
    }
  }
  return [...items.values()].sort((a, b) => b.teamCount - a.teamCount || a.name.localeCompare(b.name, "sv"));
}

// Each text to review with the verdict on it so far: judged or not, the option it counts as (null
// for wrong, or while unjudged) and whether the AI judge gave it.
export function withVerdicts(items: ReviewItem[], verdicts: Verdict[]) {
  const judged = new Map(verdicts.map((verdict) => [keyOf(verdict.slot, verdict.text), verdict]));
  return items.map((item) => {
    const verdict = judged.get(keyOf(item.slot, item.text));
    return { ...item, isJudged: verdict !== undefined, target: verdict?.target ?? null, byAi: verdict?.byAi ?? false };
  });
}

// The texts the answers hold, each once per slot with how many teams wrote it, split into those no
// accepted spelling matched, to judge (D51), and those one matched, with the answer they are (D56),
// both in slot and then alphabetical order.
export function sortTexts<Content, Answer>(review: TypedReview<Content, Answer>, content: Content, answers: Answer[]) {
  const slots = review.slots(content);
  const exact = exactMatches(slots);
  const items = new Map<string, ReviewItem & { option: number | undefined }>();
  for (const answer of answers) {
    for (const [key, text] of writtenTexts(review, slots, answer)) {
      const item = items.get(key);
      if (item) item.teamCount += 1;
      else items.set(key, { ...text, teamCount: 1, option: exact.get(key) });
    }
  }
  const sorted = [...items.values()].sort((a, b) => a.slot - b.slot || a.text.localeCompare(b.text, "sv"));
  return {
    toReview: sorted.filter((item) => item.option === undefined).map(({ option: _option, ...item }) => item),
    exact: sorted.flatMap(({ option, ...item }) => (option === undefined ? [] : [{ ...item, answer: slots[item.slot].options[option].label }])),
  };
}

// The texts no accepted spelling matched, for the hosts and the AI judge.
export function textsToReview<Content, Answer>(review: TypedReview<Content, Answer>, content: Content, answers: Answer[]): ReviewItem[] {
  return sortTexts(review, content, answers).toReview;
}

// The names verdicts gave right items outside an open slot's key, once each as first given (two
// forms of a name are one item), alphabetically, for the AI judge and the hosts' "Samma som" (D53).
export function givenNames(verdicts: Verdict[]): { slot: number; name: string }[] {
  const names = new Map<string, { slot: number; name: string }>();
  for (const { slot, target } of verdicts) {
    if (typeof target !== "string") continue;
    const key = keyOf(slot, normalizeForComparison(target));
    if (!names.has(key)) names.set(key, { slot, name: target.trim() });
  }
  return [...names.values()].sort((a, b) => a.slot - b.slot || a.name.localeCompare(b.name, "sv"));
}
