// What a team's answer counted as, part by part, for the phone's feedback after the answer is
// shown; its points are what the scores count, so the two can't disagree (D58).
export type OutcomePart = {
  // What the part answers, such as a sub-question or a place; empty for an answer of one part.
  label: string;
  // What the team answered there; empty when it left it blank.
  given: string;
  // right and wrong as judged; pending while a text waits for a verdict; repeat for another form
  // of something already counted, which adds nothing.
  result: "right" | "wrong" | "pending" | "repeat";
  // The right answer for the part; empty when there is none to show.
  correct: string;
  // What the part scored, so the phone can show it beside the part; 0 unless right.
  points: number;
  // For ingredients and lists, the place of the text it came from in the answer's own list, as
  // blanks and repeated texts have no part.
  at?: number;
};

export type Outcome = { points: number; parts: OutcomePart[] };

// The points of each outcome, in order: what the scores count.
export const pointsOf = (outcomes: Outcome[]): number[] => outcomes.map((outcome) => outcome.points);
