import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { deleteGame } from "../games/deleteGame";
import { gamesOfQuiz } from "../games/gamesOfQuiz";
import { questionsOfRound } from "../questions/questionsOfRound";
import { roundsOfQuiz } from "../rounds/roundsOfQuiz";
import { getOrThrow } from "../shared/getOrThrow";

export const createQuiz = hostMutation({
  args: { title: v.string(), year: v.number() },
  handler: async (ctx, { title, year }) => ctx.db.insert("quizzes", { title, year, updatedAt: Date.now() }),
});

export const updateQuiz = hostMutation({
  args: { quizId: v.id("quizzes"), title: v.optional(v.string()), year: v.optional(v.number()) },
  handler: async (ctx, { quizId, title, year }) => {
    await getOrThrow(ctx, "quizzes", quizId);
    await ctx.db.patch("quizzes", quizId, {
      ...(title === undefined ? {} : { title }),
      ...(year === undefined ? {} : { year }),
      updatedAt: Date.now(),
    });
  },
});

async function copyRounds(ctx: MutationCtx, fromQuizId: Id<"quizzes">, toQuizId: Id<"quizzes">) {
  for (const round of await roundsOfQuiz(ctx, fromQuizId)) {
    const { _id, _creationTime, ...roundFields } = round;
    const newRoundId = await ctx.db.insert("rounds", { ...roundFields, quizId: toQuizId });
    for (const question of await questionsOfRound(ctx, _id)) {
      const { _id: questionId, _creationTime: questionCreationTime, ...questionFields } = question;
      await ctx.db.insert("questions", { ...questionFields, quizId: toQuizId, roundId: newRoundId });
    }
  }
}

// Media files are shared with the original, not duplicated (files are never deleted in M1).
export const copyQuiz = hostMutation({
  args: { quizId: v.id("quizzes"), title: v.string(), year: v.number() },
  handler: async (ctx, { quizId, title, year }) => {
    await getOrThrow(ctx, "quizzes", quizId);
    const newQuizId = await ctx.db.insert("quizzes", { title, year, updatedAt: Date.now() });
    await copyRounds(ctx, quizId, newQuizId);
    return newQuizId;
  },
});

export const deleteQuiz = hostMutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, { quizId }) => {
    await getOrThrow(ctx, "quizzes", quizId);
    for (const game of await gamesOfQuiz(ctx, quizId)) {
      await deleteGame(ctx, game._id);
    }
    for (const round of await roundsOfQuiz(ctx, quizId)) {
      const questions = await questionsOfRound(ctx, round._id);
      await Promise.all(questions.map((question) => ctx.db.delete("questions", question._id)));
      await ctx.db.delete("rounds", round._id);
    }
    await ctx.db.delete("quizzes", quizId);
  },
});
