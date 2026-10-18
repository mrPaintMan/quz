import type { ContentOf } from "@convex/questions/questionContent";
import { hasSpelling } from "@/domain/questionTypes/hasSpelling";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";
import { highestPoints } from "@/domain/questionTypes/highestPoints";

type PaSparetContent = ContentOf<"paSparet">;
type Clue = PaSparetContent["clues"][number];

const CLUE_POINTS = [10, 8, 6, 4, 2];

// Clues with missing points are reported on their own, not as out of order.
function isDescending(clues: Clue[]): boolean {
  return clues.every((clue, index) => {
    const previous = clues[index - 1]?.points ?? null;
    return clue.points === null || previous === null || clue.points < previous;
  });
}

export const paSparetRules: QuestionTypeRules<PaSparetContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "paSparet",
    acceptedAnswers: [],
    fuzzy: true,
    clues: CLUE_POINTS.map((points) => ({ text: "", points })),
  }),
  maxPoints: (content) => highestPoints(content.clues.map((clue) => clue.points)),
  findProblems: (content) => [
    ...problemIf(!hasSpelling(content.acceptedAnswers), "Ange resmålet."),
    ...problemIf(content.clues.length === 0, "Lägg till minst en ledtråd."),
    ...content.clues.flatMap((clue, index) => [
      ...problemIf(isBlank(clue.text), `Ledtråd ${index + 1} saknar text.`),
      ...problemIfNotPositive(clue.points, `Ledtråd ${index + 1}: poängen måste vara större än 0.`),
    ]),
    ...problemIf(!isDescending(content.clues), "Varje ledtråd ska ge färre poäng än den före."),
  ],
};
