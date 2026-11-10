import { describe, expect, it } from "vitest";
import { subQuestionLetter } from "./subQuestionLetter";

describe("subQuestionLetter", () => {
  it("names the sub-questions by letter", () => {
    expect([0, 1, 2].map(subQuestionLetter)).toEqual(["a", "b", "c"]);
  });

  it("numbers one beyond the letters", () => {
    expect(subQuestionLetter(3)).toBe("4");
  });
});
