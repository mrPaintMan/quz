import type { ContentOf } from "@convex/questions/questionContent";
import type { Id } from "@convex/_generated/dataModel";
import { describe, expect, it } from "vitest";
import { multipleChoiceRules } from "./multipleChoiceRules";

const validContent: ContentOf<"multipleChoice"> = {
  type: "multipleChoice",
  options: [
    { text: "Sverige", imageId: null },
    { text: "Tyskland", imageId: null },
  ],
  correctIndex: 1,
  points: 2,
};

const messagesFor = (content: ContentOf<"multipleChoice">) =>
  multipleChoiceRules.findProblems(content).map((problem) => problem.message);

describe("multipleChoiceRules", () => {
  it("gives the question's points as max points", () => {
    expect(multipleChoiceRules.maxPoints(validContent)).toBe(2);
  });

  it("does not require a time limit", () => {
    expect(multipleChoiceRules.requiresTimeLimit).toBe(false);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it("asks for at least two options", () => {
    expect(messagesFor({ ...validContent, options: [validContent.options[0]], correctIndex: 0 })).toEqual([
      "Lägg till minst 2 alternativ.",
    ]);
  });

  it("flags an option with neither text nor image", () => {
    const options = [validContent.options[0], { text: " ", imageId: null }];
    expect(messagesFor({ ...validContent, options })).toEqual(["Alternativ 2 saknar text eller bild."]);
  });

  it("accepts an option that has only an image", () => {
    const options = [validContent.options[0], { text: "", imageId: "image" as Id<"_storage"> }];
    expect(messagesFor({ ...validContent, options })).toEqual([]);
  });

  it.each([-1, 2, 0.5])("flags correct index %s as not chosen", (correctIndex) => {
    expect(messagesFor({ ...validContent, correctIndex })).toEqual(["Välj vilket alternativ som är rätt."]);
  });

  it("flags zero points", () => {
    expect(messagesFor({ ...validContent, points: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });

  it("flags points that are not a number", () => {
    expect(messagesFor({ ...validContent, points: Number.NaN })).toEqual(["Poängen måste vara större än 0."]);
  });

  it("flags two options with the same text", () => {
    const options = [validContent.options[0], { text: "sverige ", imageId: null }];
    expect(messagesFor({ ...validContent, options })).toEqual(["Två alternativ har samma text."]);
  });

  it("asks for the correct option until one is chosen", () => {
    expect(messagesFor({ ...validContent, correctIndex: null })).toEqual(["Välj vilket alternativ som är rätt."]);
  });
});
