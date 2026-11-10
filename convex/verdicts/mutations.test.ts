import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { scoresOf, setup } from "./reviewGame.setup";

describe("judgeText", () => {
  it("counts a text for every team that wrote it, and can be changed", async () => {
    const { t, gameId, questionId } = await setup();
    expect(await scoresOf(t, gameId)).toEqual(["Röda 1", "Blå 0", "Gröna 0"]);

    await t.mutation(api.verdicts.mutations.judgeText, { ...host, gameId, questionId, slot: 1, text: "Waterlo", target: 0 });
    expect(await scoresOf(t, gameId)).toEqual(["Röda 2", "Blå 1", "Gröna 0"]);

    await t.mutation(api.verdicts.mutations.judgeText, { ...host, gameId, questionId, slot: 1, text: "waterlo", target: null });
    expect(await scoresOf(t, gameId)).toEqual(["Röda 1", "Blå 0", "Gröna 0"]);
    const review = await t.query(api.verdicts.queries.getReview, { ...host, gameId, questionId });
    expect(review?.items[1]).toMatchObject({ text: "waterlo", isJudged: true, target: null });
    expect(await t.run((ctx) => ctx.db.query("verdicts").collect())).toHaveLength(1);
  });

  it("refuses a question that is still open", async () => {
    const { t, gameId, questionId } = await setup({ closed: false });
    await expect(
      t.mutation(api.verdicts.mutations.judgeText, { ...host, gameId, questionId, slot: 0, text: "abbba", target: 0 }),
    ).rejects.toThrow("när frågan har stängt");
  });

  it("refuses a slot, option or text that doesn't exist", async () => {
    const { t, gameId, questionId } = await setup();
    const judge = (slot: number, text: string, target: number | null) =>
      t.mutation(api.verdicts.mutations.judgeText, { ...host, gameId, questionId, slot, text, target });
    await expect(judge(2, "abbba", 0)).rejects.toThrow("finns inte att granska");
    await expect(judge(0.5, "abbba", 0)).rejects.toThrow("finns inte att granska");
    await expect(judge(0, "abbba", 1)).rejects.toThrow("finns inte att granska");
    await expect(judge(0, " . ", null)).rejects.toThrow("finns inte att granska");
  });

  it("refuses anyone without the passphrase", async () => {
    const { t, gameId, questionId } = await setup();
    await expect(
      t.mutation(api.verdicts.mutations.judgeText, { hostPassphrase: "fel", gameId, questionId, slot: 0, text: "abbba", target: 0 }),
    ).rejects.toThrow();
  });
});
