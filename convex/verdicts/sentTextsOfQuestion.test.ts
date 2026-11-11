import { describe, expect, it } from "vitest";
import { reviewOf } from "@/domain/answering/registry";
import { setupConvexTest } from "../test.setup";
import { sentTextsOfQuestion } from "./sentTextsOfQuestion";

describe("sentTextsOfQuestion", () => {
  it("splits the texts of sent answers that still fit the question into those to judge and exact matches", async () => {
    const t = setupConvexTest();
    const items = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const content = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
      const question = { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "", content };
      const questionId = await ctx.db.insert("questions", question);
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "answer", questionId }, screenIndex: 2 });
      const team = (name: string, colour: "red" | "blue" | "green") => ctx.db.insert("teams", { gameId, name, colour });
      const [red, blue, green] = [await team("Röda", "red"), await team("Blå", "blue"), await team("Gröna", "green")];
      await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: { type: "freeText", fields: ["Safran"] }, lockedAt: 1 });
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content: { type: "freeText", fields: ["Kanel"] }, lockedAt: null });
      // Sent while the question was another type.
      await ctx.db.insert("answers", { gameId, teamId: green, questionId, content: { type: "number", value: 3 }, lockedAt: 1 });
      return sentTextsOfQuestion(ctx, gameId, (await ctx.db.get("questions", questionId))!, reviewOf(content)!);
    });
    expect(items).toEqual({ toReview: [{ slot: 0, text: "safran", written: "Safran", teamCount: 1 }], exact: [] });
  });
});
