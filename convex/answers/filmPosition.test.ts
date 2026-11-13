import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { filmPosition } from "./filmPosition";

const withFilm = (durationSeconds: number | null) => ({ media: { kind: "video", r2Key: "film", posterId: null, durationSeconds } }) as unknown as Doc<"questions">;
const gameAt = (playback: Doc<"games">["playback"]) => ({ playback }) as Doc<"games">;

describe("filmPosition", () => {
  it("follows a playing film from its start, and a paused one where it stopped", () => {
    expect(filmPosition(gameAt({ kind: "playing", startedAt: 1_000 }), withFilm(100), 46_000)).toEqual({ positionSeconds: 45, durationSeconds: 100 });
    expect(filmPosition(gameAt({ kind: "paused", positionMs: 85_000 }), withFilm(100), 0)).toEqual({ positionSeconds: 85, durationSeconds: 100 });
  });

  it("is at the start before the film plays, and 0 long without a known length or a film", () => {
    expect(filmPosition(gameAt(undefined), withFilm(null), 0)).toEqual({ positionSeconds: 0, durationSeconds: 0 });
    expect(filmPosition(gameAt(undefined), { media: null } as Doc<"questions">, 0)).toEqual({ positionSeconds: 0, durationSeconds: 0 });
  });
});
