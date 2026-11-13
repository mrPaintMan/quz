import { describe, expect, it } from "vitest";
import { findTripFilm } from "./findTripFilm";

describe("findTripFilm", () => {
  const video = (showsCluePoints: boolean) => ({ kind: "video" as const, screen: { kind: "lobby" as const }, posterUrl: null, durationSeconds: 120, showsCluePoints });

  it("gives the trip's film, where it is and how long it is", () => {
    const playback = { kind: "paused" as const, positionMs: 3_000 };
    expect(findTripFilm({ media: video(true), playback })).toEqual({ playback, durationSeconds: 120 });
    expect(findTripFilm({ media: video(true), playback: null })).toEqual({ playback: null, durationSeconds: 120 });
  });

  it("gives nothing for any other media", () => {
    expect(findTripFilm({ media: video(false), playback: null })).toBeNull();
    expect(findTripFilm({ media: null, playback: null })).toBeNull();
  });
});
