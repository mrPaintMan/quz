import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { questionTypeRules, rulesFor } from "./registry";

describe("rulesFor", () => {
  it("returns the rules registered for the content's type", () => {
    const content: ContentOf<"drawing"> = { type: "drawing", maxPoints: 3 };
    expect(rulesFor(content)).toBe(questionTypeRules.drawing);
  });

  it("returns rules that work on the given content", () => {
    const content: ContentOf<"activity"> = { type: "activity", maxPoints: 5 };
    expect(rulesFor(content).maxPoints(content)).toBe(5);
  });

  it.each(Object.entries(questionTypeRules))("creates empty %s content of its own type", (type, rules) => {
    expect(rules.createEmptyContent().type).toBe(type);
  });
});
