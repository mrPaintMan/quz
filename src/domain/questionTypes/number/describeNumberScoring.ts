import type { ContentOf } from "@convex/questions/questionContent";
import { formatDecimal } from "@/domain/text/formatDecimal";

const points = (value: number | null) => `${formatDecimal(value ?? 0)} p`;

// How a Gissa siffran question scores, for the hosts to read out while it is asked, worded as in
// the editor: its kind of scoring, then each level from the closest, or each place.
export function describeNumberScoring({ scoring }: ContentOf<"number">): { kind: string; rules: string[] } {
  if (scoring.mode === "closest") {
    return {
      kind: "Närmast vinner",
      rules: [...scoring.pointsByRank.map((value, index) => `Plats ${index + 1}: ${points(value)}`), "Lika nära delar plats."],
    };
  }
  const tiers = scoring.tiers
    .filter((tier): tier is { within: number; points: number | null } => tier.within !== null)
    .sort((a, b) => a.within - b.within)
    .map((tier) => `${tier.within === 0 ? "Exakt rätt" : `Inom ±${formatDecimal(tier.within)}`}: ${points(tier.points)}`);
  return { kind: "Poängnivåer", rules: [...tiers, "Bästa nivån räknas."] };
}
