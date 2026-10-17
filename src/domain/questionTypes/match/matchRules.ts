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
  maxPoints: (content) => content.pairs.length * content.pointsPerPair,
  findProblems: (content) => [
    ...problemIf(content.pairs.length < MIN_PAIRS, `Lägg till minst ${MIN_PAIRS} par.`),
    ...content.pairs.flatMap((pair, index) =>
      problemIf(isBlank(pair.left) || isBlank(pair.right), `Par ${index + 1} saknar text på en av sidorna.`),
    ),
    ...problemIf(
      hasDuplicates(content.pairs.map((pair) => pair.left)) || hasDuplicates(content.pairs.map((pair) => pair.right)),
      "Varje sak får bara finnas en gång på varje sida.",
    ),
    ...problemIfNotPositive(content.pointsPerPair),
  ],
};
