import { describe, expect, it } from "vitest";
import { internal } from "../_generated/api";
import { setupConvexTest } from "../test.setup";

describe("migrateMissingNumbers", () => {
  it("saves null where questions hold NaN, page by page", async () => {
    const t = setupConvexTest();
    const ids = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Omgång", kind: "questions" });
      const question = (position: number, maxPoints: number) =>
        ctx.db.insert("questions", {
          quizId,
          roundId,
          position,
          prompt: "",
          timeLimitSeconds: null,
          media: null,
          hostNotes: "",
          content: { type: "activity", maxPoints },
        });
      return [await question(0, Number.NaN), await question(1, 3)];
    });

    const first = await t.mutation(internal.questions.migrateMissingNumbers.migrateMissingNumbers, {
      paginationOpts: { numItems: 1, cursor: null },
    });
    const second = await t.mutation(internal.questions.migrateMissingNumbers.migrateMissingNumbers, {
      paginationOpts: { numItems: 1, cursor: first.continueCursor },
    });

    expect([first.fixed, second.fixed]).toEqual([1, 0]);
    const contents = await t.run(async (ctx) => Promise.all(ids.map(async (id) => (await ctx.db.get("questions", id))?.content)));
    expect(contents).toEqual([
      { type: "activity", maxPoints: null },
      { type: "activity", maxPoints: 3 },
    ]);
  });
});
