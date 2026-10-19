import { describe, expect, it } from "vitest";
import { internal } from "../_generated/api";
import type { QuestionContent } from "./questionContent";
import { setupConvexTest } from "../test.setup";

describe("migratePaSparetClues", () => {
  it("turns trips into five plain-text clues, page by page, and leaves other questions alone", async () => {
    const t = setupConvexTest();
    const ids = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "På spåret", kind: "paSparet" });
      const question = (position: number, content: QuestionContent) =>
        ctx.db.insert("questions", { quizId, roundId, position, prompt: "", timeLimitSeconds: null, media: null, hostNotes: "", content });
      const trip = (clues: Extract<QuestionContent, { type: "paSparet" }>["clues"]): QuestionContent => ({ type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues });
      return [
        await question(0, trip([{ text: "Gruva", points: 10 }, { text: "Ishotell", points: 8 }])),
        await question(1, trip(["1", "2", "3", "4", "5"])),
        await question(2, { type: "activity", maxPoints: 3 }),
      ];
    });

    const migrate = (cursor: string | null) =>
      t.mutation(internal.questions.migratePaSparetClues.migratePaSparetClues, { paginationOpts: { numItems: 2, cursor } });
    const first = await migrate(null);
    const second = await migrate(first.continueCursor);

    expect([first.fixed, second.fixed, second.isDone]).toEqual([1, 0, true]);
    const contents = await t.run(async (ctx) => Promise.all(ids.map(async (id) => (await ctx.db.get("questions", id))?.content)));
    expect(contents).toEqual([
      { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["Gruva", "Ishotell", "", "", ""] },
      { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["1", "2", "3", "4", "5"] },
      { type: "activity", maxPoints: 3 },
    ]);
  });
});
