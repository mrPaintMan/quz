import { ConvexError, v } from "convex/values";
import { moveItem } from "@/domain/ordering/moveItem";
import { createEmptyContent } from "@/domain/questions/createEmptyContent";
import { isTypeAllowedInRound } from "@/domain/rounds/isTypeAllowedInRound";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { questionContent, type QuestionType } from "./questionContent";
import { MAX_QUESTIONS_PER_ROUND, questionsOfRound } from "./questionsOfRound";
import { questionType } from "./questionType";
import { saveQuestionOrder } from "./saveQuestionOrder";

function requireTypeAllowed(round: Doc<"rounds">, type: QuestionType): void {
  if (!isTypeAllowedInRound(round.kind, type)) {
    throw new ConvexError("Den här frågetypen passar inte i den här ronden.");
  }
}

async function requireRoomIn(ctx: QueryCtx, roundId: Id<"rounds">): Promise<Doc<"questions">[]> {
  const questions = await questionsOfRound(ctx, roundId);
  if (questions.length >= MAX_QUESTIONS_PER_ROUND) {
    throw new ConvexError(`En rond kan ha högst ${MAX_QUESTIONS_PER_ROUND} frågor.`);
  }
  return questions;
}

export const addQuestion = hostMutation({
  args: { roundId: v.id("rounds"), type: questionType },
  handler: async (ctx, { roundId, type }) => {
    const round = await getOrThrow(ctx, "rounds", roundId);
    requireTypeAllowed(round, type);
    const questions = await requireRoomIn(ctx, roundId);
    const questionId = await ctx.db.insert("questions", {
      quizId: round.quizId,
      roundId,
      position: questions.length,
      prompt: "",
      timeLimitSeconds: null,
      media: null,
      hostNotes: "",
      content: createEmptyContent(type),
    });
    await touchQuiz(ctx, round.quizId);
    return questionId;
  },
});

// Only the given fields change, so two hosts editing different fields don't overwrite each other.
export const updateQuestion = hostMutation({
  args: {
    questionId: v.id("questions"),
    prompt: v.optional(v.string()),
    timeLimitSeconds: v.optional(v.union(v.number(), v.null())),
    hostNotes: v.optional(v.string()),
    content: v.optional(questionContent),
  },
  handler: async (ctx, { questionId, ...changes }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    if (changes.content !== undefined && changes.content.type !== question.content.type) {
      throw new ConvexError("Frågetypen byts med changeQuestionType.");
    }
    const definedChanges = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await ctx.db.patch("questions", questionId, definedChanges);
    await touchQuiz(ctx, question.quizId);
  },
});

// Replaces the content with an empty draft of the new type; the UI asks the hosts first.
export const changeQuestionType = hostMutation({
  args: { questionId: v.id("questions"), type: questionType },
  handler: async (ctx, { questionId, type }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    requireTypeAllowed(await getOrThrow(ctx, "rounds", question.roundId), type);
    await ctx.db.patch("questions", questionId, { content: createEmptyContent(type) });
    await touchQuiz(ctx, question.quizId);
  },
});

export const moveQuestion = hostMutation({
  args: { questionId: v.id("questions"), toRoundId: v.id("rounds"), toIndex: v.number() },
  handler: async (ctx, { questionId, toRoundId, toIndex }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    const toRound = await getOrThrow(ctx, "rounds", toRoundId);
    if (toRound.quizId !== question.quizId) {
      throw new ConvexError("En fråga kan bara flyttas inom samma quiz.");
    }
    requireTypeAllowed(toRound, question.content.type);

    if (toRoundId === question.roundId) {
      const questions = await questionsOfRound(ctx, toRoundId);
      const fromIndex = questions.findIndex((candidate) => candidate._id === questionId);
      await saveQuestionOrder(ctx, toRoundId, moveItem(questions, fromIndex, toIndex));
    } else {
      const target = await requireRoomIn(ctx, toRoundId);
      const source = (await questionsOfRound(ctx, question.roundId)).filter((q) => q._id !== questionId);
      await saveQuestionOrder(ctx, question.roundId, source);
      await saveQuestionOrder(ctx, toRoundId, moveItem([...target, question], target.length, toIndex));
    }
    await touchQuiz(ctx, question.quizId);
  },
});

export const deleteQuestion = hostMutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    await ctx.db.delete("questions", questionId);
    await saveQuestionOrder(ctx, question.roundId, await questionsOfRound(ctx, question.roundId));
    await touchQuiz(ctx, question.quizId);
  },
});
