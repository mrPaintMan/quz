import type { AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { formatDecimal } from "@/domain/text/formatDecimal";

type NumberContent = ContentOf<"number">;
type NumberAnswer = AnswerOf<"number">;

export type NumberShown = { type: "number" };
export type NumberRevealed = { type: "number"; answer: number | null };

// Floating point makes 0.4 − 0.1 a hair over 0.3, and its error grows with the numbers, so
// distances closer than a billionth of the answer's size count as equal.
const toleranceFor = (content: NumberContent) => 1e-9 * Math.max(1, Math.abs(content.answer ?? 0));

const distanceOf = (content: NumberContent, answer: NumberAnswer) =>
  content.answer === null || answer.value === null ? null : Math.abs(answer.value - content.answer);

// The best level the guess is within, inclusive: ±1 counts a guess exactly 1 off.
function gradeByTiers(content: NumberContent, tiers: Extract<NumberContent["scoring"], { mode: "tiers" }>["tiers"], answer: NumberAnswer) {
  const distance = distanceOf(content, answer);
  if (distance === null) return 0;
  const reached = tiers.filter((tier) => tier.within !== null && distance <= tier.within + toleranceFor(content));
  return Math.max(0, ...reached.map((tier) => tier.points ?? 0));
}

// Places by closeness, shared by equally close guesses like the leaderboard (1, 1, 3), each place
// scoring its points; a guess past the last place scoring scores nothing.
function gradeByCloseness(content: NumberContent, pointsByRank: (number | null)[], answers: NumberAnswer[]) {
  const distances = answers.map((answer) => distanceOf(content, answer));
  return distances.map((distance) => {
    if (distance === null) return 0;
    const closer = distances.filter((other) => other !== null && other < distance - toleranceFor(content)).length;
    return pointsByRank[closer] ?? 0;
  });
}

export const numberAnswering: AnsweringRules<"number", NumberShown, NumberRevealed> = {
  // The teams type their guess; there is nothing to show but the question.
  show: () => ({ type: "number" }),
  reveal: ({ answer }) => ({ type: "number", answer }),
  imageIds: () => [],
  startingAnswer: () => null,
  isComplete: (_shown, { value }) => value !== null && Number.isFinite(value),
  // The guess beside the right number, right when it scored at all (D58).
  outcomes: (content, answers) => {
    const { scoring } = content;
    const points = scoring.mode === "closest" ? gradeByCloseness(content, scoring.pointsByRank, answers) : answers.map((answer) => gradeByTiers(content, scoring.tiers, answer));
    const correct = content.answer === null ? "" : formatDecimal(content.answer);
    return answers.map(({ value }, index) => ({
      points: points[index],
      parts: [{ label: "", given: value === null ? "" : formatDecimal(value), result: points[index] > 0 ? "right" : "wrong", correct, points: points[index] }],
    }));
  },
};
