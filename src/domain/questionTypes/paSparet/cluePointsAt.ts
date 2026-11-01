import { activeClueIndex } from "./activeClueIndex";
import { PA_SPARET_CLUE_POINTS } from "./paSparetRules";

// What a guess is worth at a point in the trip's film: the active clue's points (D30).
export function cluePointsAt(positionSeconds: number, durationSeconds: number): number {
  return PA_SPARET_CLUE_POINTS[activeClueIndex(positionSeconds, durationSeconds)];
}
