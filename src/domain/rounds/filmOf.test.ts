import { describe, expect, it } from "vitest";
import { filmOf, filmsOf } from "./filmOf";

const film = { id: "f1", video: null };

describe("filmsOf", () => {
  it("gives a round's films, or none for a round made before films existed", () => {
    expect(filmsOf({ films: [film] })).toEqual([film]);
    expect(filmsOf({})).toEqual([]);
  });
});

describe("filmOf", () => {
  it("finds the film a question is asked after", () => {
    expect(filmOf({ films: [film] }, { filmId: "f1" })).toBe(film);
  });

  it("gives nothing for a question that doesn't follow a film", () => {
    expect(filmOf({ films: [film] }, {})).toBeUndefined();
  });
});
