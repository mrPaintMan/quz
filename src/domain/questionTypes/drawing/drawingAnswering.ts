import type { AnswerOf } from "@convex/answers/answerContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import type { TeamColour } from "@/domain/teams/teamColours";
import { handOutcome } from "@/domain/scoring/handOutcome";
import { fitsDrawingLimits } from "./drawingLimits";

// While asked, nothing beyond the prompt; on the answer screen every team's drawing (D62).
export type DrawingShown = { type: "drawing" };
export type TeamDrawing = { teamId: string; name: string; colour: TeamColour; strokes: AnswerOf<"drawing">["strokes"] };
export type DrawingRevealed = { type: "drawing"; drawings: TeamDrawing[] };

export const drawingAnswering: AnsweringRules<"drawing", DrawingShown, DrawingRevealed> = {
  show: () => ({ type: "drawing" }),
  reveal: (_content, graded) => ({
    type: "drawing",
    drawings: (graded?.answers ?? []).flatMap(({ strokes }, index) => {
      const team = graded?.teams[index];
      return team ? [{ teamId: team._id, name: team.name, colour: team.colour, strokes }] : [];
    }),
  }),
  revealsAnswers: true,
  revealsTeams: true,
  scoredByHand: true,
  fitsLimits: fitsDrawingLimits,
  imageIds: () => [],
  startingAnswer: () => null,
  isComplete: (_shown, { strokes }) => strokes.length > 0,
  // The hosts give the points by hand, as adjustments the scores add up (D61, D62), so the answers
  // themselves score nothing and wait for them.
  outcomes: (_content, answers) => answers.map(() => handOutcome(null)),
};
