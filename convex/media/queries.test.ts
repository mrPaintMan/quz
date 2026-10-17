import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

describe("getMediaUrl", () => {
  it("gives a URL for an uploaded file", async () => {
    const t = setupConvexTest();
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["bild"])));
    await expect(t.query(api.media.queries.getMediaUrl, { ...host, storageId })).resolves.toEqual(expect.any(String));
  });

  it("gives null for a file that is gone", async () => {
    const t = setupConvexTest();
    const storageId = await t.run(async (ctx) => {
      const id = await ctx.storage.store(new Blob(["bild"]));
      await ctx.storage.delete(id);
      return id;
    });
    await expect(t.query(api.media.queries.getMediaUrl, { ...host, storageId })).resolves.toBeNull();
  });
});
