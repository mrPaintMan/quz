import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import { setupConvexTest } from "../test.setup";
import { linkScreenMedia } from "./linkScreenMedia";

describe("linkScreenMedia", () => {
  it("links a picture or sound to its file", async () => {
    const t = setupConvexTest();
    const shown = await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob(["bild"]));
      return { image: await linkScreenMedia(ctx, { kind: "image", storageId }), audio: await linkScreenMedia(ctx, { kind: "audio", storageId }) };
    });
    expect(shown.image).toEqual({ kind: "image", url: expect.any(String) });
    expect(shown.audio).toEqual({ kind: "audio", url: expect.any(String) });
  });

  it("links a video's still, or none when it has none", async () => {
    const t = setupConvexTest();
    const screen = { kind: "question" as const, questionId: "q1" as Id<"questions"> };
    const shown = await t.run(async (ctx) => {
      const posterId = await ctx.storage.store(new Blob(["still"]));
      return [
        await linkScreenMedia(ctx, { kind: "video", screen, posterId, durationSeconds: 90, showsCluePoints: true }),
        await linkScreenMedia(ctx, { kind: "video", screen, posterId: null, durationSeconds: null, showsCluePoints: false }),
      ];
    });
    expect(shown).toEqual([
      { kind: "video", screen, posterUrl: expect.any(String), durationSeconds: 90, showsCluePoints: true },
      { kind: "video", screen, posterUrl: null, durationSeconds: null, showsCluePoints: false },
    ]);
  });

  it("shows nothing for a file that is gone, or no media", async () => {
    const t = setupConvexTest();
    const shown = await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob(["bild"]));
      await ctx.storage.delete(storageId);
      return [await linkScreenMedia(ctx, { kind: "image", storageId }), await linkScreenMedia(ctx, null)];
    });
    expect(shown).toEqual([null, null]);
  });
});
