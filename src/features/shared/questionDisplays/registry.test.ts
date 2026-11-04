import { describe, expect, it } from "vitest";
import { answeringRegistry } from "@/domain/answering/registry";
import { questionDisplays } from "./registry";

describe("questionDisplays", () => {
  it("has a TV display for exactly the types whose answering is built", () => {
    for (const [type, answering] of Object.entries(answeringRegistry)) {
      expect(questionDisplays[type as keyof typeof questionDisplays] !== null).toBe(answering !== null);
    }
  });
});
