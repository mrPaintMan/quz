import { ConvexError, v } from "convex/values";
import { filmsOf } from "@/domain/rounds/filmOf";
import { MAX_FILM_QUESTIONS } from "@/domain/rounds/filmQuestionTypes";
import { hasFixedQuestionList } from "@/domain/rounds/hasFixedQuestionList";
import { orderPaSparetQuestions } from "@/domain/rounds/orderPaSparetQuestions";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { insertQuestion } from "../questions/insertQuestion";
import type { QuestionType } from "../questions/questionContent";
import { questionsOfRound } from "../questions/questionsOfRound";
import { questionType } from "../questions/questionType";
import { requireFilmQuestionType } from "../questions/requireFilmQuestionType";
import { saveQuestionOrder } from "../questions/saveQuestionOrder";
import { videoMedia } from "../questions/table";
import { touchQuiz } from "../quizzes/touchQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import type { Film } from "./table";

async function getPaSparetRound(ctx: MutationCtx, roundId: Id<"rounds">): Promise<Doc<"rounds">> {
  const round = await getOrThrow(ctx, "rounds", roundId);
  if (!hasFixedQuestionList(round.kind)) {
    throw new ConvexError("Filmer hör till På spåret-omgångar.");
  }
  return round;
}

function requireFilm(round: Doc<"rounds">, filmId: string): Film {
  const film = filmsOf(round).find((candidate) => candidate.id === filmId);
  if (film === undefined) {
    throw new ConvexError("Filmen finns inte längre.");
  }
  return film;
}

async function saveFilms(ctx: MutationCtx, round: Doc<"rounds">, films: Film[]): Promise<void> {
  await ctx.db.patch("rounds", round._id, { films });
  await touchQuiz(ctx, round.quizId);
}

// Adds a question after a film, keeping the round's order and the cap of three film questions.
async function addQuestionAfter(ctx: MutationCtx, round: Doc<"rounds">, films: Film[], filmId: string, type: QuestionType) {
  requireFilmQuestionType(type);
  const questions = await questionsOfRound(ctx, round._id);
  if (questions.filter((question) => question.filmId !== undefined).length >= MAX_FILM_QUESTIONS) {
    throw new ConvexError(`En På spåret-omgång kan ha högst ${MAX_FILM_QUESTIONS} frågor till sina filmer.`);
  }
  const questionId = await insertQuestion(ctx, round, questions.length, type, filmId);
  const added = await getOrThrow(ctx, "questions", questionId);
  await saveQuestionOrder(ctx, round._id, orderPaSparetQuestions([...questions, added], films));
  return questionId;
}

// A new film at the end of the round, with its first question; the video is uploaded after.
export const addFilm = hostMutation({
  args: { roundId: v.id("rounds"), type: questionType },
  handler: async (ctx, { roundId, type }) => {
    const round = await getPaSparetRound(ctx, roundId);
    const filmId = crypto.randomUUID();
    const films = [...filmsOf(round), { id: filmId, video: null }];
    const questionId = await addQuestionAfter(ctx, round, films, filmId, type);
    await saveFilms(ctx, round, films);
    return { filmId, questionId };
  },
});

export const addFilmQuestion = hostMutation({
  args: { roundId: v.id("rounds"), filmId: v.string(), type: questionType },
  handler: async (ctx, { roundId, filmId, type }) => {
    const round = await getPaSparetRound(ctx, roundId);
    requireFilm(round, filmId);
    const questionId = await addQuestionAfter(ctx, round, filmsOf(round), filmId, type);
    await touchQuiz(ctx, round.quizId);
    return questionId;
  },
});

export const setFilmVideo = hostMutation({
  args: { roundId: v.id("rounds"), filmId: v.string(), video: v.union(videoMedia, v.null()) },
  handler: async (ctx, { roundId, filmId, video }) => {
    const round = await getPaSparetRound(ctx, roundId);
    requireFilm(round, filmId);
    await saveFilms(ctx, round, filmsOf(round).map((film) => (film.id === filmId ? { ...film, video } : film)));
  },
});

// The film and the questions asked after it go together; the video file stays in R2 (D22).
export const deleteFilm = hostMutation({
  args: { roundId: v.id("rounds"), filmId: v.string() },
  handler: async (ctx, { roundId, filmId }) => {
    const round = await getPaSparetRound(ctx, roundId);
    requireFilm(round, filmId);
    const questions = await questionsOfRound(ctx, roundId);
    const [gone, kept] = [questions.filter((q) => q.filmId === filmId), questions.filter((q) => q.filmId !== filmId)];
    await Promise.all(gone.map((question) => ctx.db.delete("questions", question._id)));
    await saveQuestionOrder(ctx, roundId, kept);
    await saveFilms(ctx, round, filmsOf(round).filter((film) => film.id !== filmId));
  },
});
