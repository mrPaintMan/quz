import type { ContentOf } from "@convex/questions/questionContent";
import { isBlank } from "../isBlank";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

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
    ...problemIf(content.pointsPerPair <= 0, "Poängen måste vara större än 0."),
  ],
};
