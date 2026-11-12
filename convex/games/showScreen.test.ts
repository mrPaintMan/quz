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
      return showScreen(ctx, gameId, { kind: "question", questionId }, rounds);
    });
    expect(shown).toEqual({
      view: { kind: "question", roundNumber: 1, questionNumber: 0, prompt: "Vem är det?", answeredInApp: false, shown: null },
      media: { kind: "image", url: expect.any(String) },
      imageUrls: {},
    });
  });

  it("reveals a list's items the teams got right, from their sent answers and the verdicts", async () => {
    const t = setupConvexTest();
    const shown = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Geografi", kind: "questions" });
      const content = { type: "list" as const, acceptedItems: [{ spellings: ["Göteborg"] }], pointsPerItem: 1, fuzzy: true, aiAssist: false };
      const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Nämn svenska städer", timeLimitSeconds: 60, media: null, hostNotes: "", content });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "answer", questionId }, screenIndex: 4, closedQuestionIds: [questionId] });
      const team = (name: string, colour: "red" | "blue") => ctx.db.insert("teams", { gameId, name, colour });
      const [red, blue] = [await team("Röda", "red"), await team("Blå", "blue")];
      await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: { type: "list", items: ["göteborg", "Malmö", "Lund"] }, lockedAt: 1 });
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content: { type: "list", items: ["Gothenburg", "Malmoe"] }, lockedAt: 1 });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "malmö", target: "Malmö" });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "malmoe", target: "Malmö" });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "gothenburg", target: 0 });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "lund", target: null });
      const { rounds } = await placeOfGame(ctx, (await ctx.db.get("games", gameId))!);
      return showScreen(ctx, gameId, { kind: "answer", questionId }, rounds);
    });
    expect(shown.view).toMatchObject({
      revealed: {
        type: "list",
        items: [
          { name: "Göteborg", teamCount: 2 },
          { name: "Malmö", teamCount: 2 },
        ],
      },
    });
  });

  it("reveals a map pin's target and every team's pin with its team", async () => {
    const t = setupConvexTest();
    const shown = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Geografi", kind: "questions" });
      const target = { lat: 59.33, lng: 18.07 };
      const content = { type: "mapPin" as const, target, radiusMeters: 100_000, points: 3, initialView: { center: { lat: 62, lng: 15 }, zoom: 4 } };
      const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Var ligger Stockholm?", timeLimitSeconds: null, media: null, hostNotes: "", content });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "answer", questionId }, screenIndex: 4, closedQuestionIds: [questionId] });
      const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
      await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: { type: "mapPin", pin: { lat: 59.86, lng: 17.64 } }, lockedAt: 1 });
      const { rounds } = await placeOfGame(ctx, (await ctx.db.get("games", gameId))!);
      return showScreen(ctx, gameId, { kind: "answer", questionId }, rounds);
    });
    expect(shown.view).toMatchObject({
      revealed: { type: "mapPin", target: { lat: 59.33, lng: 18.07 }, pins: [{ name: "Röda", colour: "red", points: 3 }] },
    });
  });
});

