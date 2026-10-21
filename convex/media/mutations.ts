import { ConvexError, v } from "convex/values";
import { hostMutation } from "../auth/hostFunctions";
import { rulesFor } from "@/domain/questionTypes/registry";
import { questionMedia } from "../questions/table";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { filmStorage } from "./filmStorage";

// Long enough to play a film from start to end after pressing play.
const FILM_LINK_SECONDS = 4 * 60 * 60;

export const generateUploadUrl = hostMutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

// Where the browser uploads a film straight to R2, and the key it will be stored under.
export const generateFilmUploadUrl = hostMutation({
  args: {},
  handler: async () => filmStorage.generateUploadUrl(),
});

// A signed link to play a film. A mutation rather than a query, because a query's result is
// cached and could hand out a link that has already expired.
export const getFilmUrl = hostMutation({
  args: { r2Key: v.string() },
  handler: async (_ctx, { r2Key }) => filmStorage.getUrl(r2Key, { expiresIn: FILM_LINK_SECONDS }),
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
