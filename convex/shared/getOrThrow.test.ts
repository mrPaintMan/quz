import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { getOrThrow } from "./getOrThrow";

describe("getOrThrow", () => {
  it("returns the document when it exists", async () => {
    const t = setupConvexTest();
    const title = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      return (await getOrThrow(ctx, "quizzes", quizId)).title;
    });
    expect(title).toBe("Julquiz");
  });

  it("throws a Swedish message when the document is gone", async () => {
    const t = setupConvexTest();
    await expect(
      t.run(async (ctx) => {
        const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
        await ctx.db.delete("quizzes", quizId);
        return getOrThrow(ctx, "quizzes", quizId);
      }),
    ).rejects.toThrow("Hittades inte");
  });
});
