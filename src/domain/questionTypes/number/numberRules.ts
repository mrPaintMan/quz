import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "../problemIf";
import type { Problem, QuestionTypeRules } from "../questionTypeRules";

type NumberContent = ContentOf<"number">;
type Scoring = NumberContent["scoring"];

function findScoringProblems(scoring: Scoring): Problem[] {
  if (scoring.mode === "tiers") {
    return [
      ...problemIf(scoring.tiers.length === 0, "Lägg till minst en poängnivå."),
      ...scoring.tiers.flatMap((tier, index) => [
        ...problemIf(tier.within < 0, `Poängnivå ${index + 1}: marginalen kan inte vara negativ.`),
        ...problemIf(tier.points <= 0, `Poängnivå ${index + 1}: poängen måste vara större än 0.`),
      ]),
    ];
  }
  return [
    ...problemIf(scoring.pointsByRank.length === 0, "Ange poäng för minst en placering."),
    ...problemIf(
      scoring.pointsByRank.some((points) => points <= 0),
      "Poängen för varje placering måste vara större än 0.",
    ),
  ];
}

function highestPoints(scoring: Scoring): number {
  const points = scoring.mode === "tiers" ? scoring.tiers.map((tier) => tier.points) : scoring.pointsByRank;
  return Math.max(0, ...points);
}

export const numberRules: QuestionTypeRules<NumberContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => highestPoints(content.scoring),
  findProblems: (content) => [
    ...problemIf(!Number.isFinite(content.answer), "Ange det rätta svaret."),
    ...findScoringProblems(content.scoring),
  ],
};
