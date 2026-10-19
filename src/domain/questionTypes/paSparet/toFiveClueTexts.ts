import type { ContentOf } from "@convex/questions/questionContent";
import { clueText } from "./clueText";
import { PA_SPARET_CLUE_POINTS } from "./paSparetRules";

type Clues = ContentOf<"paSparet">["clues"];

// A trip's clues as exactly five plain texts: points dropped, missing clues empty and any
// past the fifth cut off (D30). Used by the editor and the one-off migratePaSparetClues.
export function toFiveClueTexts(clues: Clues): string[] {
  return PA_SPARET_CLUE_POINTS.map((_, index) => {
    const clue = clues[index];
    return clue === undefined ? "" : clueText(clue);
  });
}
