import type { ContentOf } from "@convex/questions/questionContent";
import { hasDuplicates } from "@/domain/questionTypes/hasDuplicates";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type MatchContent = ContentOf<"match">;

const MIN_PAIRS = 2;

export const matchRules: QuestionTypeRules<MatchContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "match",
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
    pointsPerPair: 1,
  }),
  maxPoints: (content) => content.pairs.length * content.pointsPerPair,
  findProblems: (content) => [
    ...problemIf(content.pairs.length < MIN_PAIRS, `Lägg till minst ${MIN_PAIRS} par.`),
    ...content.pairs.flatMap((pair, index) =>
      problemIf(isBlank(pair.left) || isBlank(pair.right), `Par ${index + 1} saknar text på en av sidorna.`),
    ),
    // The right side may repeat (two songs by the same artist); the left side is what teams draw from.
    ...problemIf(
      hasDuplicates(content.pairs.map((pair) => pair.left)),
      "Varje alternativ i vänstra listan får bara finnas en gång.",
    ),
    ...problemIfNotPositive(content.pointsPerPair),
  ],
};
