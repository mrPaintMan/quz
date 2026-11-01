import { activeClueIndex } from "./activeClueIndex";
import { PA_SPARET_CLUE_POINTS } from "./paSparetRules";

export type ClueProgress = { index: number; points: number; secondsToNext: number | null; hasEnded: boolean };

// Where the trip's film is among its clues: the active one, and the time to the next, which the
// last clue doesn't have (D30).
export function clueProgress(positionSeconds: number, durationSeconds: number): ClueProgress {
  const index = activeClueIndex(positionSeconds, durationSeconds);
  const isLast = index === PA_SPARET_CLUE_POINTS.length - 1;
  const nextStartsAt = ((index + 1) * durationSeconds) / PA_SPARET_CLUE_POINTS.length;
  return {
    index,
    points: PA_SPARET_CLUE_POINTS[index],
    secondsToNext: isLast ? null : nextStartsAt - positionSeconds,
    hasEnded: positionSeconds >= durationSeconds,
  };
}
