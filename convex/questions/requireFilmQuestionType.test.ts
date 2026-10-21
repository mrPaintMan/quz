import { describe, expect, it } from "vitest";
import { requireFilmQuestionType } from "./requireFilmQuestionType";

describe("requireFilmQuestionType", () => {
  it("lets a type that can follow a film through", () => {
    expect(() => requireFilmQuestionType("freeText")).not.toThrow();
  });

  it("refuses a type that can't follow a film", () => {
    expect(() => requireFilmQuestionType("activity")).toThrow("kan inte ställas efter en film");
  });
});
