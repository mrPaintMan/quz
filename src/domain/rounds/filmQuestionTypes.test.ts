import { describe, expect, it } from "vitest";
import { filmQuestionTypes, isFilmQuestionType } from "./filmQuestionTypes";

describe("isFilmQuestionType", () => {
  it.each(["freeText", "multipleChoice", "number", "mapPin"] as const)("lets a %s question follow a film", (type) => {
    expect(isFilmQuestionType(type)).toBe(true);
  });

  it.each(["paSparet", "activity"] as const)("keeps a %s question away from films", (type) => {
    expect(isFilmQuestionType(type)).toBe(false);
  });
});

describe("filmQuestionTypes", () => {
  it("lists every type that can follow a film", () => {
    expect(filmQuestionTypes()).toContain("freeText");
    expect(filmQuestionTypes()).not.toContain("activity");
  });
});
