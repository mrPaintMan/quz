import type { AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import type { OutcomePart } from "@/domain/answering/outcome";
import { firstFilledIn } from "@/domain/questionTypes/firstFilledIn";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { textOutcomes, type TypedReview } from "@/domain/review/typedReview";
import type { TeamColour } from "@/domain/teams/teamColours";
import { PA_SPARET_CLUE_POINTS } from "./paSparetRules";

type Trip = ContentOf<"paSparet">;
type Guess = AnswerOf<"paSparet">;

// While asked, nothing beyond the film; on the answer screen the destination and every team's
// guess with the points it braked at and what it scored, most points first (D63).
export type PaSparetShown = { type: "paSparet" };
export type TripGuess = {
  teamId: string;
  name: string;
  colour: TeamColour;
  guess: string;
  // The points of the clue showing when the team pulled the brake; null when it never did.
  brakePoints: number | null;
  points: number;
  result: OutcomePart["result"];
};
export type PaSparetRevealed = { type: "paSparet"; destination: string; guesses: TripGuess[] };

// The points a brake at a clue is worth; null without a brake.
export const brakePointsOf = (brakeClueIndex: number | null): number | null =>
  brakeClueIndex === null ? null : (PA_SPARET_CLUE_POINTS[brakeClueIndex] ?? null);

// The destination is one slot with its spellings as its one option. Only a guess locked by the
// brake counts, so only those go to the AI judge and the hosts (D63).
const tripReview: TypedReview<Trip, Guess> = {
  slots: ({ acceptedAnswers }) => [{ title: "", options: [{ label: firstFilledIn(acceptedAnswers), spellings: acceptedAnswers }] }],
  texts: ({ guess, brakeClueIndex }) => (brakeClueIndex === null || isBlank(guess) ? [] : [{ slot: 0, text: guess }]),
  pointsPerMatch: () => 1,
};

export const paSparetAnswering: AnsweringRules<"paSparet", PaSparetShown, PaSparetRevealed> = {
  show: () => ({ type: "paSparet" }),
  reveal: (content, graded) => {
    const answers = graded?.answers ?? [];
    const outcomes = paSparetAnswering.outcomes(content, answers, graded?.verdicts);
    const guesses = answers.flatMap((answer, index) => {
      const team = graded?.teams[index];
      const part = outcomes[index].parts[0];
      if (!team) return [];
      return [{ teamId: team._id, name: team.name, colour: team.colour, guess: answer.guess.trim(), brakePoints: brakePointsOf(answer.brakeClueIndex), points: part.points, result: part.result }];
    });
    return {
      type: "paSparet",
      destination: firstFilledIn(content.acceptedAnswers),
      guesses: guesses.sort((a, b) => b.points - a.points || (b.brakePoints ?? -1) - (a.brakePoints ?? -1)),
    };
  },
  revealsAnswers: true,
  revealsTeams: true,
  imageIds: () => [],
  startingAnswer: () => null,
  // A guess is sent by pulling the brake, which the server stamps with the clue showing (D63).
  isComplete: (_shown, { guess }) => !isBlank(guess),
  // A right guess scores the points of the clue it braked at; a wrong one, or one never braked,
  // nothing (D63).
  outcomes: (content, answers, verdicts = []) =>
    textOutcomes(tripReview, content, answers, verdicts).map(({ texts }, index) => {
      const answer = answers[index];
      const result = texts[0]?.result ?? "wrong";
      const points = result === "right" ? (brakePointsOf(answer.brakeClueIndex) ?? 0) : 0;
      return { points, parts: [{ label: "", given: answer.guess.trim(), result, correct: "", points }] };
    }),
  review: tripReview,
};
