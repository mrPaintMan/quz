import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { questionsOfRound } from "./questionsOfRound";

const draft = { prompt: "", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "activity" as const, maxPoints: 1 } };

describe("questionsOfRound", () => {
  it("returns only the round's questions, ordered by position", async () => {
    const t = setupConvexTest();
    const prompts = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "A", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "R1", kind: "questions" });
      const otherRoundId = await ctx.db.insert("rounds", { quizId, position: 1, title: "R2", kind: "questions" });
      await ctx.db.insert("questions", { ...draft, quizId, roundId, position: 1, prompt: "Andra" });
      await ctx.db.insert("questions", { ...draft, quizId, roundId, position: 0, prompt: "Första" });
      await ctx.db.insert("questions", { ...draft, quizId, roundId: otherRoundId, position: 0, prompt: "Annan rond" });
      return (await questionsOfRound(ctx, roundId)).map((question) => question.prompt);
    });
    expect(prompts).toEqual(["Första", "Andra"]);
  });
});
