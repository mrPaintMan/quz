import type { ContentOf } from "@convex/questions/questionContent";
import { formatDecimal } from "@/domain/text/formatDecimal";

const points = (value: number | null) => `${formatDecimal(value ?? 0)} p`;

// How a Gissa siffran question scores, in lines the hosts can read out while it is asked, worded
// as in the editor: each level from the closest, or each place.
export function describeNumberScoring({ scoring }: ContentOf<"number">): string[] {
  if (scoring.mode === "closest") {
    return ["Närmast vinner", ...scoring.pointsByRank.map((value, index) => `Plats ${index + 1}: ${points(value)}`), "Lika nära delar plats."];
  }
  const tiers = scoring.tiers
    .filter((tier): tier is { within: number; points: number | null } => tier.within !== null)
    .sort((a, b) => a.within - b.within)
    .map((tier) => `${tier.within === 0 ? "Exakt rätt" : `Inom ±${formatDecimal(tier.within)}`}: ${points(tier.points)}`);
  return ["Poängnivåer", ...tiers, "Bästa nivån räknas."];
}
