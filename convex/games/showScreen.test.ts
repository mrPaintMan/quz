import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { placeOfGame } from "./placeOfGame";
import { showScreen } from "./showScreen";

describe("showScreen", () => {
  it("describes the screen and links its media", async () => {
    const t = setupConvexTest();
    const shown = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmusik", kind: "questions" });
      const storageId = await ctx.storage.store(new Blob(["bild"]));
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Vem är det?",
        timeLimitSeconds: null,
        media: { kind: "image", storageId },
        hostNotes: "",
        content: { type: "activity", maxPoints: 5 },
      });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
      const { rounds } = await placeOfGame(ctx, (await ctx.db.get("games", gameId))!);
      return showScreen(ctx, { kind: "question", questionId }, rounds);
    });
    expect(shown).toEqual({
      view: { kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vem är det?", answeredInApp: false, shown: null },
      media: { kind: "image", url: expect.any(String) },
      imageUrls: {},
    });
  });
});
