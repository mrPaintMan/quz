import type { Film } from "@convex/rounds/table";

type Placed = { filmId?: string };

// A På spåret round's order: the trip first, then each film's questions, film by film in the
// round's order, each film's questions in the order given (D33).
export function orderPaSparetQuestions<Q extends Placed>(questions: readonly Q[], films: readonly Film[]): Q[] {
  return [
    ...questions.filter((question) => question.filmId === undefined),
    ...films.flatMap((film) => questions.filter((question) => question.filmId === film.id)),
  ];
}
