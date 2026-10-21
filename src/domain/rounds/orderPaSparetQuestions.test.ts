import { describe, expect, it } from "vitest";
import { orderPaSparetQuestions } from "./orderPaSparetQuestions";

const films = [
  { id: "a", video: null },
  { id: "b", video: null },
];

describe("orderPaSparetQuestions", () => {
  it("puts the trip first, then each film's questions in film order", () => {
    const questions = [{ name: "b1", filmId: "b" }, { name: "a1", filmId: "a" }, { name: "trip" }, { name: "a2", filmId: "a" }];
    expect(orderPaSparetQuestions(questions, films).map((question) => question.name)).toEqual(["trip", "a1", "a2", "b1"]);
  });

  it("leaves out questions whose film is gone", () => {
    expect(orderPaSparetQuestions([{ name: "x", filmId: "gone" }], films)).toEqual([]);
  });
});
