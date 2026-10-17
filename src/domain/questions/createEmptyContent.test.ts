import { describe, expect, it } from "vitest";
import { createEmptyContent } from "./createEmptyContent";
import { findQuestionProblems } from "./findQuestionProblems";

describe("createEmptyContent", () => {
  it("creates content of the requested type", () => {
    expect(createEmptyContent("paSparet").type).toBe("paSparet");
  });

  it("starts På spåret with clues worth 10, 8, 6, 4 and 2", () => {
    expect(createEmptyContent("paSparet").clues.map((clue) => clue.points)).toEqual([10, 8, 6, 4, 2]);
  });

  it("starts as a draft that still needs filling in", () => {
    const question = { prompt: "", timeLimitSeconds: null, content: createEmptyContent("multipleChoice") };
    expect(findQuestionProblems(question).length).toBeGreaterThan(0);
  });
});
