import { PA_SPARET_CLUE_POINTS } from "./paSparetRules";

// Which clue is showing at a point in the film: the film is split into five equal parts and
// clue n shows during part n, so the clues are evenly paced whatever the film's length (D30).
export function activeClueIndex(positionSeconds: number, durationSeconds: number): number {
  const clueCount = PA_SPARET_CLUE_POINTS.length;
  const part = Math.floor((positionSeconds / durationSeconds) * clueCount);
  return Math.min(Math.max(part, 0), clueCount - 1);
}
