import type { ContentOf } from "@convex/questions/questionContent";
import { isPositive } from "@/domain/questionTypes/isPositive";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { Problem, QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";
import { highestPoints } from "@/domain/questionTypes/highestPoints";

type NumberContent = ContentOf<"number">;
type Scoring = NumberContent["scoring"];
type Tier = Extract<Scoring, { mode: "tiers" }>["tiers"][number];
type FilledInTier = { within: number; points: number };

// Sorted by margin, each wider tier must give fewer points, and no two tiers may share a margin.
// Tiers with a missing margin or points are reported on their own, not as a collision.
function areTiersConsistent(tiers: Tier[]): boolean {
  const filledIn = tiers.filter((tier): tier is FilledInTier => tier.within !== null && tier.points !== null);
  if (filledIn.length < tiers.length) {
    return true;
  }
  const byMargin = [...filledIn].sort((a, b) => a.within - b.within);
  return byMargin.every(
    (tier, index) =>
      index === 0 || (tier.within > byMargin[index - 1].within && tier.points < byMargin[index - 1].points),
  );
}

function findTierProblems(tiers: Tier[]): Problem[] {
  return [
    ...problemIf(tiers.length === 0, "Lägg till minst en poängnivå."),
    ...tiers.flatMap((tier, index) => [
      ...problemIf(tier.within === null, `Poängnivå ${index + 1}: ange en marginal.`),
      ...problemIf(tier.within !== null && tier.within < 0, `Poängnivå ${index + 1}: marginalen kan inte vara negativ.`),
      ...problemIfNotPositive(tier.points, `Poängnivå ${index + 1}: poängen måste vara större än 0.`),
    ]),
    ...problemIf(
      !areTiersConsistent(tiers),
      "Poängnivåerna krockar: en större marginal ska ge färre poäng, och två nivåer kan inte ha samma marginal.",
    ),
  ];
}

function findRankProblems(pointsByRank: (number | null)[]): Problem[] {
  return [
    ...problemIf(pointsByRank.length === 0, "Ange poäng för minst en placering."),
    ...problemIf(
      !pointsByRank.every(isPositive),
      "Poängen för varje placering måste vara större än 0.",
    ),
    ...problemIf(
      pointsByRank.some((points, index) => {
        const previous = pointsByRank[index - 1] ?? null;
        return points !== null && previous !== null && points > previous;
      }),
      "En lägre placering kan inte ge fler poäng än den före.",
    ),
  ];
}

function scoringPoints(scoring: Scoring): (number | null)[] {
  return scoring.mode === "tiers" ? scoring.tiers.map((tier) => tier.points) : scoring.pointsByRank;
}

export const numberRules: QuestionTypeRules<NumberContent> = {
  requiresTimeLimit: false,
  requiresVideo: false,
  createEmptyContent: () => ({
    type: "number",
    answer: null,
    scoring: { mode: "tiers", tiers: [{ within: 0, points: 1 }] },
  }),
  maxPoints: (content) => highestPoints(scoringPoints(content.scoring)),
  findProblems: (content) => [
    ...problemIf(content.answer === null, "Ange det rätta svaret."),
    ...(content.scoring.mode === "tiers"
      ? findTierProblems(content.scoring.tiers)
      : findRankProblems(content.scoring.pointsByRank)),
  ],
};
