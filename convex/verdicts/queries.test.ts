import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { reviewIn, setup, setupList } from "./reviewGame.setup";

describe("getReview", () => {
  it("lists the sent texts without an exact match once per field, with how many teams wrote them", async () => {
    const review = await reviewIn(await setup());
    expect(review?.slots).toEqual([
      { title: "a) Artist", answer: "ABBA", options: ["ABBA"], isOpen: false, names: [] },
      { title: "b) Låt", answer: "Waterloo", options: ["Waterloo"], isOpen: false, names: [] },
    ]);
    expect(review?.aiStatus).toBeNull();
    // The red team's "Abba" matched exactly.
    expect(review?.hasExact).toBe(true);
    expect(review?.items).toEqual([
      { slot: 0, text: "abbba", written: "Abbba", teamCount: 1, isJudged: false, target: null, byAi: false },
      { slot: 1, text: "waterlo", written: "Waterlo", teamCount: 2, isJudged: false, target: null, byAi: false },
    ]);
  });

  it("marks a list's slot open, with the names already given to items outside its key", async () => {
    const game = await setupList();
    await game.t.run((ctx) => ctx.db.insert("verdicts", { gameId: game.gameId, questionId: game.questionId, slot: 0, text: "lund", target: "Lund" }));
    const review = await reviewIn(game);
    expect(review?.slots).toEqual([{ title: "", answer: null, options: ["Göteborg"], isOpen: true, names: ["Lund"] }]);
    expect(review?.items.map(({ text, target }) => [text, target])).toEqual([
      ["gothenburg", null],
      ["lund", "Lund"],
      ["lunds stad", null],
    ]);
  });

  it("says how the AI judge is getting on", async () => {
    const game = await setup();
    await game.t.run((ctx) => ctx.db.insert("aiJudgings", { gameId: game.gameId, questionId: game.questionId, status: "failed" }));
    expect((await reviewIn(game))?.aiStatus).toBe("failed");
  });

  it("is null while the question is open, and for a question without typed answers", async () => {
    const open = await setup({ closed: false });
    await expect(reviewIn(open)).resolves.toBeNull();
    const number = await setup({ content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } } });
    await expect(reviewIn(number)).resolves.toBeNull();
  });

  it("refuses anyone without the passphrase", async () => {
    const { t, gameId, questionId } = await setup();
    await expect(t.query(api.verdicts.queries.getReview, { hostPassphrase: "fel", gameId, questionId })).rejects.toThrow();
  });
});

describe("getAllAnswers", () => {
  it("gives every team its texts in the order written, with what each counts as and the team's points", async () => {
    const { t, gameId, questionId } = await setup();
    await t.run((ctx) => ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "abbba", target: 0, byAi: true }));
    const all = await t.query(api.verdicts.queries.getAllAnswers, { ...host, gameId, questionId });
    expect(all?.slots.map((slot) => slot.title)).toEqual(["a) Artist", "b) Låt"]);
    expect(all?.teams.map(({ name, hasAnswered, points, texts }) => ({ name, hasAnswered, points, texts: texts.map((text: { written: string; isJudged: boolean; target: unknown; byAi: boolean; result: string }) => [text.written, text.isJudged, text.target, text.byAi, text.result]) }))).toEqual([
      {
        name: "Röda",
        hasAnswered: true,
        points: 1,
        texts: [
          ["Abba", true, 0, false, "right"],
          ["Waterlo", false, null, false, "pending"],
        ],
      },
      {
        name: "Blå",
        hasAnswered: true,
        points: 1,
        texts: [
          ["Abbba", true, 0, true, "right"],
          ["waterlo.", false, null, false, "pending"],
        ],
      },
      // The green team's answer is only a draft.
      { name: "Gröna", hasAnswered: false, points: 0, texts: [] },
    ]);
  });

  it("is null while the question is open, and for anyone without the passphrase it refuses", async () => {
    const open = await setup({ closed: false });
    await expect(open.t.query(api.verdicts.queries.getAllAnswers, { ...host, gameId: open.gameId, questionId: open.questionId })).resolves.toBeNull();
    await expect(open.t.query(api.verdicts.queries.getAllAnswers, { hostPassphrase: "fel", gameId: open.gameId, questionId: open.questionId })).rejects.toThrow();
  });
});

