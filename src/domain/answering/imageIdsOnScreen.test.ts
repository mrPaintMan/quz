import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { imageIdsOnScreen } from "./imageIdsOnScreen";

const questionId = "q1" as Id<"questions">;
const picture = "img1" as Id<"_storage">;
const rounds = [
  {
    questions: [
      { _id: questionId, content: { type: "multipleChoice" as const, options: [{ text: "", imageId: picture }], correctIndex: 0, points: 1 } },
    ],
  },
];

describe("imageIdsOnScreen", () => {
  it("names the question's pictures on its question and answer screens", () => {
    expect(imageIdsOnScreen({ kind: "question", questionId }, rounds)).toEqual([picture]);
    expect(imageIdsOnScreen({ kind: "answer", questionId }, rounds)).toEqual([picture]);
  });

  it("names none on other screens", () => {
    expect(imageIdsOnScreen({ kind: "rules" }, rounds)).toEqual([]);
  });
});
