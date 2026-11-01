import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { placeOfGame } from "./placeOfGame";

describe("placeOfGame", () => {
  it("builds the screens from the quiz and finds the game's place in them", async () => {
    const t = setupConvexTest();
    const { roundId, questionId, place } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Lekar", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Pepparkakshus",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "activity", maxPoints: 5 },
      });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
      return { roundId, questionId, place: await placeOfGame(ctx, (await ctx.db.get("games", gameId))!) };
    });
    expect(place.sequence).toEqual([
      { kind: "lobby" },
      { kind: "rules" },
      { kind: "roundIntro", roundId },
      { kind: "question", questionId },
      { kind: "finalLeaderboard" },
    ]);
    expect(place.screenIndex).toBe(3);
    expect(place.rounds.map((round) => round.title)).toEqual(["Lekar"]);
  });
});
