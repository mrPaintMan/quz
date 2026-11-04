import { describe, expect, it } from "vitest";
import { answeringRegistry } from "@/domain/answering/registry";
import { answerInputs } from "./registry";

describe("answerInputs", () => {
  it("has an answer input for exactly the types whose answering is built", () => {
    for (const [type, answering] of Object.entries(answeringRegistry)) {
      expect(answerInputs[type as keyof typeof answerInputs] !== null).toBe(answering !== null);
    }
  });
});
