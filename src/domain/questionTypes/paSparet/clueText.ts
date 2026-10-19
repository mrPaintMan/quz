import type { ContentOf } from "@convex/questions/questionContent";

type Clue = ContentOf<"paSparet">["clues"][number];

// A clue's text, also for clues saved before D30 with their own points. Deleted together
// with the legacy shape once migratePaSparetClues has run on every deployment.
export function clueText(clue: Clue): string {
  return typeof clue === "string" ? clue : clue.text;
}
