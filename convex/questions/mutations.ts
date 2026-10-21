import { ConvexError, v } from "convex/values";
import { moveItem } from "@/domain/ordering/moveItem";
import { createEmptyContent } from "@/domain/questions/createEmptyContent";
import { isFilmQuestionType } from "@/domain/rounds/filmQuestionTypes";
import { hasFixedQuestionList } from "@/domain/rounds/hasFixedQuestionList";
import { isTypeAllowedInRound } from "@/domain/rounds/isTypeAllowedInRound";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { insertQuestion } from "./insertQuestion";
import { numberOrNull } from "./numberOrNull";
import { questionContent, type QuestionType } from "./questionContent";
import { MAX_QUESTIONS_PER_ROUND, questionsOfRound } from "./questionsOfRound";
import { questionType } from "./questionType";
import { saveQuestionOrder } from "./saveQuestionOrder";

function requireTypeAllowed(round: Doc<"rounds">, type: QuestionType): void {
  if (!isTypeAllowedInRound(round.kind, type)) {
    throw new ConvexError("Den här frågetypen passar inte i den här omgången.");
  }
}

export function requireFilmQuestionType(type: QuestionType): void {
  if (!isFilmQuestionType(type)) {
    throw new ConvexError("Den här frågetypen kan inte ställas efter en film.");
  }
}

// A På spåret round gets its trip when created and its other questions through its films (D32).
const FIXED_LIST = "En På spåret-omgång har sin resa och frågor till sina filmer; lägg till frågor via en film.";

async function requireRoomIn(ctx: QueryCtx, round: Doc<"rounds">): Promise<Doc<"questions">[]> {
  if (hasFixedQuestionList(round.kind)) {
    throw new ConvexError(FIXED_LIST);
  }
  const questions = await questionsOfRound(ctx, round._id);
  if (questions.length >= MAX_QUESTIONS_PER_ROUND) {
    throw new ConvexError(`En omgång kan ha högst ${MAX_QUESTIONS_PER_ROUND} frågor.`);
  }
  return questions;
}

// A trip goes only with its round, and a film keeps at least one question (D30, D32).
async function requireDeletable(ctx: QueryCtx, question: Doc<"questions">): Promise<void> {
  const round = await getOrThrow(ctx, "rounds", question.roundId);
  if (!hasFixedQuestionList(round.kind)) return;
  if (question.filmId === undefined) {
    throw new ConvexError("Resan hör till omgången. Ta bort omgången i stället.");
  }
  const sameFilm = (await questionsOfRound(ctx, round._id)).filter((other) => other.filmId === question.filmId);
  if (sameFilm.length === 1) {
    throw new ConvexError("En film behöver minst en fråga. Ta bort filmen i stället.");
  }
}

export const addQuestion = hostMutation({
  args: { roundId: v.id("rounds"), type: questionType },
  handler: async (ctx, { roundId, type }) => {
    const round = await getOrThrow(ctx, "rounds", roundId);
    requireTypeAllowed(round, type);
    const questions = await requireRoomIn(ctx, round);
    const questionId = await insertQuestion(ctx, round, questions.length, type);
    await touchQuiz(ctx, round.quizId);
    return questionId;
  },
});

// Only the given fields change. Content of a type the question no longer has is a stale draft
// (saved just as the type was changed) and is dropped, while the other fields are still saved.
export const updateQuestion = hostMutation({
  args: {
    questionId: v.id("questions"),
    prompt: v.optional(v.string()),
    timeLimitSeconds: v.optional(numberOrNull),
    hostNotes: v.optional(v.string()),
    content: v.optional(questionContent),
  },
  handler: async (ctx, { questionId, content, ...otherChanges }) => {
    const question = await getOrThrow(ctx, "questions", questionId);
    const isCurrentType = content !== undefined && content.type === question.content.type;
    const changes = isCurrentType ? { ...otherChanges, content } : otherChanges;
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
    if (question.filmId === undefined) {
      requireTypeAllowed(await getOrThrow(ctx, "rounds", question.roundId), type);
    } else {
      requireFilmQuestionType(type);
    }
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
    if (hasFixedQuestionList((await getOrThrow(ctx, "rounds", question.roundId)).kind) || hasFixedQuestionList(toRound.kind)) {
      throw new ConvexError("Frågorna i en På spåret-omgång har en fast ordning och flyttas inte.");
    }

    if (toRoundId === question.roundId) {
      const questions = await questionsOfRound(ctx, toRoundId);
      const fromIndex = questions.findIndex((candidate) => candidate._id === questionId);
      await saveQuestionOrder(ctx, toRoundId, moveItem(questions, fromIndex, toIndex));
    } else {
      const target = await requireRoomIn(ctx, toRound);
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
    await requireDeletable(ctx, question);
    await ctx.db.delete("questions", questionId);
    await saveQuestionOrder(ctx, question.roundId, await questionsOfRound(ctx, question.roundId));
    await touchQuiz(ctx, question.quizId);
  },
});
