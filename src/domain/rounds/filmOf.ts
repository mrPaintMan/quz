import type { Film } from "@convex/rounds/table";

type RoundWithFilms = { films?: Film[] };

// A round's films; a round made before D32 has none.
export function filmsOf(round: RoundWithFilms): Film[] {
  return round.films ?? [];
}

// The film a question is asked after, or undefined for a question that doesn't follow one.
export function filmOf(round: RoundWithFilms, question: { filmId?: string }): Film | undefined {
  return question.filmId === undefined ? undefined : filmsOf(round).find((film) => film.id === question.filmId);
}
