import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { host, setupConvexTest } from "../test.setup";

async function setupQuizWithRounds(titles: string[]) {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
  const roundIds: Id<"rounds">[] = [];
  for (const title of titles) {
    roundIds.push(await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title }));
  }
  const roundTitles = async () =>
    (await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId }))?.rounds.map((round) => round.title);
  return { t, quizId, roundIds, roundTitles };
}

describe("addRound", () => {
  it("adds rounds at the end of the quiz", async () => {
    const { roundTitles } = await setupQuizWithRounds(["Julmusik", "Julmat"]);
    expect(await roundTitles()).toEqual(["Julmusik", "Julmat"]);
  });

  it("refuses more than 50 rounds", async () => {
    const { t, quizId } = await setupQuizWithRounds([]);
    await t.run(async (ctx) => {
      for (let position = 0; position < 50; position++) {
        await ctx.db.insert("rounds", { quizId, position, title: `Rond ${position}`, kind: "questions" });
      }
    });
    await expect(
      t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "En till" }),
    ).rejects.toThrow("högst 50 omgångar");
  });
});

describe("renameRound", () => {
  it("changes the round's title", async () => {
    const { t, roundIds, roundTitles } = await setupQuizWithRounds(["Julmat"]);
    await t.mutation(api.rounds.mutations.renameRound, { ...host, roundId: roundIds[0], title: "Julbord" });
    expect(await roundTitles()).toEqual(["Julbord"]);
  });
});

describe("moveRound", () => {
  it("moves a round to a new position", async () => {
    const { t, roundIds, roundTitles } = await setupQuizWithRounds(["Julmusik", "Julmat", "Julfilmer"]);
    await t.mutation(api.rounds.mutations.moveRound, { ...host, roundId: roundIds[2], toIndex: 0 });
    expect(await roundTitles()).toEqual(["Julfilmer", "Julmusik", "Julmat"]);
  });
});

describe("deleteRound", () => {
  it("deletes the round with its questions and closes the gap", async () => {
    const { t, roundIds, roundTitles } = await setupQuizWithRounds(["Julmusik", "Julmat", "Julfilmer"]);
    const questionId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: roundIds[1], type: "activity" });
    await t.mutation(api.rounds.mutations.deleteRound, { ...host, roundId: roundIds[1] });

    expect(await roundTitles()).toEqual(["Julmusik", "Julfilmer"]);
    const positions = await t.run(async (ctx) => ({
      question: await ctx.db.get("questions", questionId),
      last: (await ctx.db.get("rounds", roundIds[2]))?.position,
    }));
    expect(positions).toEqual({ question: null, last: 1 });
  });
});
