import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { insertQuestion } from "./insertQuestion";

describe("insertQuestion", () => {
  it("inserts an empty draft of the type at the given position", async () => {
    const t = setupConvexTest();
    const question = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const round = await ctx.db.get("rounds", roundId);
      return ctx.db.get("questions", await insertQuestion(ctx, round!, 3, "activity"));
    });
    expect(question).toMatchObject({
      position: 3,
      prompt: "",
      timeLimitSeconds: null,
      media: null,
      hostNotes: "",
      content: { type: "activity", maxPoints: 1 },
    });
  });
});
