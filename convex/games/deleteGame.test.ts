import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { deleteGame, MAX_ANSWERS_PER_GAME } from "./deleteGame";

describe("deleteGame", () => {
  it("deletes the game with its teams, answers and adjustments, and leaves other games alone", async () => {
    const t = setupConvexTest();
    const remaining = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Hur många?",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } },
      });
      const addPlayedGame = async () => {
        const gameId = await ctx.db.insert("games", { quizId, endedAt: 1 });
        const teamId = await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
        await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "number", value: 4 }, lockedAt: 1 });
        await ctx.db.insert("adjustments", { gameId, teamId, questionId: null, points: 2, note: "Bonus" });
        return gameId;
      };
      const gameId = await addPlayedGame();
      const otherGameId = await addPlayedGame();

      await deleteGame(ctx, gameId);
      const count = async (table: "games" | "teams" | "answers" | "adjustments") => (await ctx.db.query(table).collect()).length;
      return {
        game: await ctx.db.get("games", gameId),
        otherGame: (await ctx.db.get("games", otherGameId))?._id,
        otherGameId,
        counts: [await count("games"), await count("teams"), await count("answers"), await count("adjustments")],
      };
    });
    expect(remaining.game).toBeNull();
    expect(remaining.otherGame).toBe(remaining.otherGameId);
    expect(remaining.counts).toEqual([1, 1, 1, 1]);
  });

  it("refuses rather than delete only part of a game with too many answers", async () => {
    const t = setupConvexTest();
    await expect(
      t.run(async (ctx) => {
        const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
        const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
        const questionId = await ctx.db.insert("questions", {
          quizId,
          roundId,
          position: 0,
          prompt: "Hur många?",
          timeLimitSeconds: null,
          media: null,
          hostNotes: "",
          content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } },
        });
        const gameId = await ctx.db.insert("games", { quizId, endedAt: 1 });
        const teamId = await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
        for (let i = 0; i < MAX_ANSWERS_PER_GAME; i++) {
          await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "number", value: i }, lockedAt: 1 });
        }
        await deleteGame(ctx, gameId);
      }),
    ).rejects.toThrow("för många svar");
  });
});
