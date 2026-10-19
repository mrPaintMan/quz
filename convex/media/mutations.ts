import { ConvexError, v } from "convex/values";
import { hostMutation } from "../auth/hostFunctions";
import { rulesFor } from "@/domain/questionTypes/registry";
import { questionMedia } from "../questions/table";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";

export const generateUploadUrl = hostMutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const setQuestionMedia = hostMutation({
  args: {
    questionId: v.id("questions"),
    media: questionMedia,
  },
  handler: async (ctx, { questionId, media }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    if (rulesFor(question.content).requiresVideo && media.kind !== "video") {
      throw new ConvexError("Den här frågan behöver en film.");
    }
    await ctx.db.patch("questions", questionId, { media });
    await touchQuiz(ctx, question.quizId);
  },
});

// The file itself stays in storage: copied quizzes may still use it.
export const removeQuestionMedia = hostMutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    await ctx.db.patch("questions", questionId, { media: null });
    await touchQuiz(ctx, question.quizId);
  },
});
