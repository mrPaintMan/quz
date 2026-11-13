import type { Outcome } from "@/domain/answering/outcome";

// What an answer the hosts score by hand counted as (D62): waiting until they give it points, then
// those points, lit when above 0.
export function handOutcome(points: number | null): Outcome {
  if (points === null) return { points: 0, parts: [{ label: "", given: "", result: "pending", correct: "", points: 0 }] };
  return { points, parts: [{ label: "", given: "", result: points > 0 ? "right" : "wrong", correct: "", points }] };
}
