import { ConvexError, v } from "convex/values";
import { moveItem } from "@/domain/ordering/moveItem";
import { allowedQuestionTypes } from "@/domain/rounds/allowedQuestionTypes";
import { holdsOneQuestion } from "@/domain/rounds/holdsOneQuestion";
import { hostMutation } from "../auth/hostFunctions";
import { insertQuestion } from "../questions/insertQuestion";
import { questionsOfRound } from "../questions/questionsOfRound";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { MAX_ROUNDS_PER_QUIZ, roundsOfQuiz } from "./roundsOfQuiz";
import { saveRoundOrder } from "./saveRoundOrder";
import { roundKind } from "./table";

export const addRound = hostMutation({
  args: { quizId: v.id("quizzes"), kind: roundKind, title: v.string() },
  handler: async (ctx, { quizId, kind, title }) => {
    await getOrThrow(ctx, "quizzes", quizId);
    const rounds = await roundsOfQuiz(ctx, quizId);
    if (rounds.length >= MAX_ROUNDS_PER_QUIZ) {
      throw new ConvexError(`Ett quiz kan ha högst ${MAX_ROUNDS_PER_QUIZ} omgångar.`);
    }
    const roundId = await ctx.db.insert("rounds", { quizId, kind, title, position: rounds.length });
    if (holdsOneQuestion(kind)) {
      await insertQuestion(ctx, await getOrThrow(ctx, "rounds", roundId), 0, allowedQuestionTypes(kind)[0]);
    }
    await touchQuiz(ctx, quizId);
    return roundId;
  },
});

export const renameRound = hostMutation({
  args: { roundId: v.id("rounds"), title: v.string() },
  handler: async (ctx, { roundId, title }) => {
    const round = await getOrThrow(ctx, "rounds", roundId);
    await ctx.db.patch("rounds", roundId, { title });
    await touchQuiz(ctx, round.quizId);
  },
});

export const moveRound = hostMutation({
  args: { roundId: v.id("rounds"), toIndex: v.number() },
  handler: async (ctx, { roundId, toIndex }) => {
    const round = await getOrThrow(ctx, "rounds", roundId);
    const rounds = await roundsOfQuiz(ctx, round.quizId);
    const fromIndex = rounds.findIndex((candidate) => candidate._id === roundId);
    await saveRoundOrder(ctx, moveItem(rounds, fromIndex, toIndex));
    await touchQuiz(ctx, round.quizId);
  },
});

export const deleteRound = hostMutation({
  args: { roundId: v.id("rounds") },
  handler: async (ctx, { roundId }) => {
    const round = await getOrThrow(ctx, "rounds", roundId);
    const questions = await questionsOfRound(ctx, roundId);
    await Promise.all(questions.map((question) => ctx.db.delete("questions", question._id)));
    await ctx.db.delete("rounds", roundId);
    const remaining = await roundsOfQuiz(ctx, round.quizId);
    await saveRoundOrder(ctx, remaining);
    await touchQuiz(ctx, round.quizId);
  },
});
