import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { reviewIn, setup } from "./reviewGame.setup";

describe("getReview", () => {
  it("lists the sent texts without an exact match once per field, with how many teams wrote them", async () => {
    const review = await reviewIn(await setup());
    expect(review?.slots).toEqual([
      { title: "a) Artist", options: ["ABBA"] },
      { title: "b) Låt", options: ["Waterloo"] },
    ]);
    expect(review?.aiStatus).toBeNull();
    expect(review?.items).toEqual([
      { slot: 0, text: "abbba", written: "Abbba", teamCount: 1, isJudged: false, target: null, byAi: false },
      { slot: 1, text: "waterlo", written: "Waterlo", teamCount: 2, isJudged: false, target: null, byAi: false },
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
