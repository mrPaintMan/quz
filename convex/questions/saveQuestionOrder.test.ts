import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { questionsOfRound } from "./questionsOfRound";
import { saveQuestionOrder } from "./saveQuestionOrder";

const draft = { prompt: "", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "activity" as const, maxPoints: 1 } };

describe("saveQuestionOrder", () => {
  it("places the questions in the given round in the given order", async () => {
    const t = setupConvexTest();
    const result = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "A", year: 2026, updatedAt: 0 });
      const from = await ctx.db.insert("rounds", { quizId, position: 0, title: "R1", kind: "questions" });
      const to = await ctx.db.insert("rounds", { quizId, position: 1, title: "R2", kind: "questions" });
      await ctx.db.insert("questions", { ...draft, quizId, roundId: from, position: 0, prompt: "A" });
      await ctx.db.insert("questions", { ...draft, quizId, roundId: to, position: 0, prompt: "B" });
      const [a] = await questionsOfRound(ctx, from);
      const [b] = await questionsOfRound(ctx, to);
      await saveQuestionOrder(ctx, to, [b, a]);
      return {
        from: (await questionsOfRound(ctx, from)).map((question) => question.prompt),
        to: (await questionsOfRound(ctx, to)).map((question) => question.prompt),
      };
    });
    expect(result).toEqual({ from: [], to: ["B", "A"] });
  });
});
