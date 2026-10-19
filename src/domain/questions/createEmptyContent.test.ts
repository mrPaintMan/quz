import { describe, expect, it } from "vitest";
import { createEmptyContent } from "./createEmptyContent";
import { findQuestionProblems } from "./findQuestionProblems";

describe("createEmptyContent", () => {
  it("creates content of the requested type", () => {
    expect(createEmptyContent("paSparet").type).toBe("paSparet");
  });

  it("starts a På spåret trip with five empty clues", () => {
    expect(createEmptyContent("paSparet").clues).toEqual(["", "", "", "", ""]);
  });

  it("starts as a draft that still needs filling in", () => {
    const question = { prompt: "", timeLimitSeconds: null, media: null, content: createEmptyContent("multipleChoice") };
    expect(findQuestionProblems(question).length).toBeGreaterThan(0);
  });
});
