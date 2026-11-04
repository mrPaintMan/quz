import { ConvexError, v } from "convex/values";
import { answeringOf, isAnswerComplete } from "@/domain/answering/registry";
import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { answerContent, type AnswerContent } from "./answerContent";
import { requireAnswerable } from "./requireAnswerable";

const answerArgs = { teamId: v.id("teams"), questionId: v.id("questions"), content: answerContent };
type AnswerArgs = { teamId: Id<"teams">; questionId: Id<"questions">; content: AnswerContent };

async function saveAnswer(ctx: MutationCtx, { teamId, questionId, content }: AnswerArgs, lockedAt: number | null) {
  const { game, question, answer } = await requireAnswerable(ctx, teamId, questionId, content);
  const shown = answeringOf(question.content)?.show(question.content) ?? null;
  if (lockedAt !== null && !isAnswerComplete(shown, content)) {
    throw new ConvexError("Fyll i svaret innan ni skickar det.");
  }
  if (answer) {
    await ctx.db.patch("answers", answer._id, { content, lockedAt });
    return;
  }
  await ctx.db.insert("answers", { gameId: game._id, teamId, questionId, content, lockedAt });
}

// Public, like joining (D3): the phone's saved team id is its only key (D34). Drafts are saved
// as the team types, so a phone that sleeps loses nothing when the answers lock (D16).
export const saveAnswerDraft = mutation({
  args: answerArgs,
  handler: async (ctx, args) => saveAnswer(ctx, args, null),
});

// Sending saves the answer and locks it; it can't be changed after that (D16).
export const sendAnswer = mutation({
  args: answerArgs,
  handler: async (ctx, args) => saveAnswer(ctx, args, Date.now()),
});
