import type { ContentOf } from "@convex/questions/questionContent";
import { hasSpelling } from "@/domain/questionTypes/hasSpelling";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type PaSparetContent = ContentOf<"paSparet">;
type Clue = PaSparetContent["clues"][number];

function isDescending(clues: Clue[]): boolean {
  return clues.every((clue, index) => index === 0 || clue.points < clues[index - 1].points);
}

export const paSparetRules: QuestionTypeRules<PaSparetContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => Math.max(0, ...content.clues.map((clue) => clue.points)),
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
