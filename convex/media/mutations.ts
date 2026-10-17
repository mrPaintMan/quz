import { v } from "convex/values";
import { hostMutation } from "../auth/hostFunctions";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";

export const generateUploadUrl = hostMutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const setQuestionMedia = hostMutation({
  args: {
    questionId: v.id("questions"),
    kind: v.union(v.literal("image"), v.literal("audio"), v.literal("video")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { questionId, kind, storageId }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    await ctx.db.patch("questions", questionId, { media: { kind, storageId } });
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
