import { describe, expect, it } from "vitest";
import { allowedQuestionTypes } from "./allowedQuestionTypes";

describe("allowedQuestionTypes", () => {
  it("offers only På spåret in a På spåret round, and everything else in a question round", () => {
    expect(allowedQuestionTypes("paSparet")).toEqual(["paSparet"]);
    expect(allowedQuestionTypes("questions")).not.toContain("paSparet");
    expect(allowedQuestionTypes("questions")).toHaveLength(10);
  });
});
