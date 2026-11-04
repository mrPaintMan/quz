import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { linkImages } from "./linkImages";

describe("linkImages", () => {
  it("links each picture by its file, leaving out files that are gone", async () => {
    const t = setupConvexTest();
    const { kept, links } = await t.run(async (ctx) => {
      const kept = await ctx.storage.store(new Blob(["bild"]));
      const gone = await ctx.storage.store(new Blob(["bild"]));
      await ctx.storage.delete(gone);
      return { kept, links: await linkImages(ctx, [kept, gone]) };
    });
    expect(links).toEqual({ [kept]: expect.any(String) });
  });
});
