import { v } from "convex/values";
import { hostQuery } from "../auth/hostFunctions";
import { questionsOfRound } from "../questions/questionsOfRound";
import { roundsOfQuiz } from "../rounds/roundsOfQuiz";

const MAX_QUIZZES = 50;

export const listQuizzes = hostQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("quizzes").withIndex("by_updatedAt").order("desc").take(MAX_QUIZZES),
});

// The whole quiz in one live query, so the editor updates when the other host saves.
export const getQuizTree = hostQuery({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, { quizId }) => {
    const quiz = await ctx.db.get("quizzes", quizId);
    if (quiz === null) {
      return null;
    }
    const rounds = await roundsOfQuiz(ctx, quizId);
    const roundsWithQuestions = await Promise.all(
      rounds.map(async (round) => ({ ...round, questions: await questionsOfRound(ctx, round._id) })),
    );
    return { quiz, rounds: roundsWithQuestions };
  },
});
