import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { withBrake } from "./withBrake";

const trip = {
  content: { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["a", "b", "c", "d", "e"] },
  media: { kind: "video", r2Key: "film", posterId: null, durationSeconds: 100 },
} as unknown as Doc<"questions">;
const gameAt = (playback: Doc<"games">["playback"]) => ({ playback }) as Doc<"games">;
const guess = { type: "paSparet" as const, guess: "Kiruna", brakeClueIndex: 3 };

describe("withBrake", () => {
  it("stamps a sent guess with the clue showing where the film is now", () => {
    expect(withBrake(gameAt({ kind: "playing", startedAt: 1_000 }), trip, guess, true, 46_000)).toEqual({ ...guess, brakeClueIndex: 2 });
    expect(withBrake(gameAt({ kind: "paused", positionMs: 85_000 }), trip, guess, true, 0)).toEqual({ ...guess, brakeClueIndex: 4 });
  });

  it("gives the first clue before the film has started", () => {
    expect(withBrake(gameAt(undefined), trip, guess, true, 0)).toEqual({ ...guess, brakeClueIndex: 0 });
  });

  it("never lets a draft carry a brake", () => {
    expect(withBrake(gameAt({ kind: "paused", positionMs: 85_000 }), trip, guess, false, 0)).toEqual({ ...guess, brakeClueIndex: null });
  });

  it("leaves other answers alone", () => {
    const number = { type: "number" as const, value: 3 };
    expect(withBrake(gameAt(undefined), trip, number, true, 0)).toBe(number);
  });
});
