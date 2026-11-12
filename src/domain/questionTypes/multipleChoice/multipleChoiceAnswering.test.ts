import { describe, expect, it } from "vitest";
import { pointsOf } from "@/domain/answering/outcome";
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

  it("starts with nothing picked", () => {
    expect(multipleChoiceAnswering.startingAnswer(multipleChoiceAnswering.show(content))).toBeNull();
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
    expect(pointsOf(multipleChoiceAnswering.outcomes(content, [answer(1), answer(0), answer(null)]))).toEqual([2, 0, 0]);
  });

  it("says which option the team picked beside the right one, a picture by its letter", () => {
    expect(multipleChoiceAnswering.outcomes(content, [answer(0), answer(1), answer(null)]).map((outcome) => outcome.parts[0])).toEqual([
      { label: "", given: "A · Sverige", result: "wrong", correct: "B", points: 0 },
      { label: "", given: "B", result: "right", correct: "B", points: 2 },
      { label: "", given: "", result: "wrong", correct: "B", points: 0 },
    ]);
  });
});
