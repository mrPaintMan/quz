import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { ContentOf } from "@convex/questions/questionContent";
import { multipleChoiceAnswering } from "./multipleChoiceAnswering";

const picture = "img1" as Id<"_storage">;
const content: ContentOf<"multipleChoice"> = {
  type: "multipleChoice",
  options: [
    { text: "Sverige", imageId: null },
    { text: "", imageId: picture },
  ],
  correctIndex: 1,
  points: 2,
};
const answer = (optionIndex: number | null) => ({ type: "multipleChoice" as const, optionIndex });

describe("multipleChoiceAnswering", () => {
  it("shows the options without the right one", () => {
    expect(multipleChoiceAnswering.show(content)).toEqual({ type: "multipleChoice", options: content.options });
  });

  it("reveals the right option on the answer screen", () => {
    expect(multipleChoiceAnswering.reveal(content)).toEqual({ type: "multipleChoice", options: content.options, correctIndex: 1 });
  });

  it("names the options' pictures", () => {
    expect(multipleChoiceAnswering.imageIds(content)).toEqual([picture]);
  });

  it("can be sent once one of the options shown is picked", () => {
    const shown = multipleChoiceAnswering.show(content);
    expect(multipleChoiceAnswering.isComplete(shown, answer(1))).toBe(true);
    expect(multipleChoiceAnswering.isComplete(shown, answer(null))).toBe(false);
    expect(multipleChoiceAnswering.isComplete(shown, answer(2))).toBe(false);
    expect(multipleChoiceAnswering.isComplete(shown, answer(-1))).toBe(false);
    expect(multipleChoiceAnswering.isComplete(shown, answer(0.5))).toBe(false);
  });

  it("scores the full points for the right option and nothing otherwise", () => {
    expect(multipleChoiceAnswering.grade(content, [answer(1), answer(0), answer(null)])).toEqual([2, 0, 0]);
  });
});
