import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { playbackForMedia } from "./playbackForMedia";

const file = "file1" as Id<"_storage">;

describe("playbackForMedia", () => {
  it.each([
    { kind: "audio" as const, storageId: file },
    { kind: "video" as const, questionId: "q1" as Id<"questions">, posterId: null },
  ])("waits at the start of a %o clip", (media) => {
    expect(playbackForMedia(media)).toEqual({ kind: "paused", positionMs: 0 });
  });

  it("has nothing to play for a picture or no media", () => {
    expect(playbackForMedia({ kind: "image", storageId: file })).toBeUndefined();
    expect(playbackForMedia(null)).toBeUndefined();
  });
});
