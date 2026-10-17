import type { ContentOf } from "@convex/questions/questionContent";
import { isPositive } from "@/domain/questionTypes/isPositive";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { Problem, QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type NumberContent = ContentOf<"number">;
type Scoring = NumberContent["scoring"];
type Tier = Extract<Scoring, { mode: "tiers" }>["tiers"][number];

// Sorted by margin, each wider tier must give fewer points, and no two tiers may share a margin.
// Tiers with a missing margin or points are reported on their own, not as a collision.
function areTiersConsistent(tiers: Tier[]): boolean {
  if (tiers.some((tier) => Number.isNaN(tier.within) || Number.isNaN(tier.points))) {
    return true;
  }
  const byMargin = [...tiers].sort((a, b) => a.within - b.within);
  return byMargin.every(
    (tier, index) =>
      index === 0 || (tier.within > byMargin[index - 1].within && tier.points < byMargin[index - 1].points),
  );
}

function findTierProblems(tiers: Tier[]): Problem[] {
  return [
    ...problemIf(tiers.length === 0, "Lägg till minst en poängnivå."),
    ...tiers.flatMap((tier, index) => [
      ...problemIf(Number.isNaN(tier.within), `Poängnivå ${index + 1}: ange en marginal.`),
      ...problemIf(tier.within < 0, `Poängnivå ${index + 1}: marginalen kan inte vara negativ.`),
      ...problemIfNotPositive(tier.points, `Poängnivå ${index + 1}: poängen måste vara större än 0.`),
    ]),
    ...problemIf(
      !areTiersConsistent(tiers),
      "Poängnivåerna krockar: en större marginal ska ge färre poäng, och två nivåer kan inte ha samma marginal.",
    ),
  ];
}

function findRankProblems(pointsByRank: number[]): Problem[] {
  return [
    ...problemIf(pointsByRank.length === 0, "Ange poäng för minst en placering."),
    ...problemIf(
      !pointsByRank.every(isPositive),
      "Poängen för varje placering måste vara större än 0.",
    ),
    ...problemIf(
      pointsByRank.some((points, index) => index > 0 && points > pointsByRank[index - 1]),
      "En lägre placering kan inte ge fler poäng än den före.",
    ),
  ];
}

function highestPoints(scoring: Scoring): number {
  const points = scoring.mode === "tiers" ? scoring.tiers.map((tier) => tier.points) : scoring.pointsByRank;
  return Math.max(0, ...points);
}

export const numberRules: QuestionTypeRules<NumberContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "number",
    answer: null,
    scoring: { mode: "tiers", tiers: [{ within: 0, points: 1 }] },
  }),
  maxPoints: (content) => highestPoints(content.scoring),
  findProblems: (content) => [
    ...problemIf(content.answer === null || !Number.isFinite(content.answer), "Ange det rätta svaret."),
    ...(content.scoring.mode === "tiers"
      ? findTierProblems(content.scoring.tiers)
      : findRankProblems(content.scoring.pointsByRank)),
  ],
};
