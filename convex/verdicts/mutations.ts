import { ConvexError, v } from "convex/values";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import { hostMutation } from "../auth/hostFunctions";
import { requireRunningGame } from "../games/requireRunningGame";
import { getOrThrow } from "../shared/getOrThrow";
import { judgingOfQuestion } from "./judgingOfQuestion";

// The hosts judge a typed text once for every team that wrote it in that slot: the accepted answer
// it counts as, by its place, a list item outside the key, by its name (D53), or null for wrong
// (D51), once its answers are locked (D55). Judging again changes the verdict, and the scores
// follow, as they are summed on every read (D43).
export const judgeText = hostMutation({
  args: {
    gameId: v.id("games"),
    questionId: v.id("questions"),
    slot: v.number(),
    text: v.string(),
    target: v.union(v.number(), v.string(), v.null()),
  },
  handler: async (ctx, { gameId, questionId, slot, text, target }) => {
    const game = await requireRunningGame(ctx, gameId);
    const question = await getOrThrow(ctx, "questions", questionId);
    const { isLocked, review, items } = await judgingOfQuestion(ctx, game, question);
    if (!isLocked) {
      throw new ConvexError("Svaren kan granskas när de är låsta.");
    }
    const normalized = normalizeForComparison(text);
    // Only texts a team sent are judged, which also bounds how many verdicts a question gets.
    const reviewSlot = review?.slots(question.content)[slot];
    const options = reviewSlot?.options ?? [];
    const isSent = items.some((item) => item.slot === slot && item.text === normalized);
    const isOption =
      target === null ||
      (typeof target === "number" && Number.isInteger(target) && target >= 0 && target < options.length) ||
      (typeof target === "string" && reviewSlot?.isOpen === true && normalizeForComparison(target) !== "");
    if (!isSent || !isOption) {
      throw new ConvexError("Svaret finns inte att granska.");
    }
    const existing = await ctx.db
      .query("verdicts")
      .withIndex("by_gameId_and_questionId_and_slot_and_text", (q) =>
        q.eq("gameId", gameId).eq("questionId", questionId).eq("slot", slot).eq("text", normalized),
      )
      .unique();
    if (existing) {
      await ctx.db.patch("verdicts", existing._id, { target, byAi: undefined });
      return;
    }
    await ctx.db.insert("verdicts", { gameId, questionId, slot, text: normalized, target });
  },
});
