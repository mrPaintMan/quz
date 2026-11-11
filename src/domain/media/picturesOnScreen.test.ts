import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import type { QuestionMedia } from "@convex/questions/table";
import { picturesOnScreen } from "./picturesOnScreen";

const questionId = "q1" as Id<"questions">;
const file = (id: string) => id as Id<"_storage">;
const choice: QuestionContent = {
  type: "multipleChoice",
  options: [
    { text: "", imageId: file("option") },
    { text: "Text", imageId: null },
  ],
  correctIndex: 0,
  points: 1,
};
const roundsWith = (media: QuestionMedia | null, content: QuestionContent = choice) => [
  { _id: "r1" as Id<"rounds">, questions: [{ _id: questionId, media, content }] },
];

describe("picturesOnScreen", () => {
  it("gives a question's picture and its image options", () => {
    expect(picturesOnScreen({ kind: "question", questionId }, roundsWith({ kind: "image", storageId: file("photo") }))).toEqual([
      file("photo"),
      file("option"),
    ]);
  });

  it("gives a video's still, but no sound", () => {
    const video: QuestionMedia = { kind: "video", r2Key: "film", posterId: file("still"), durationSeconds: 20 };
    const activity: QuestionContent = { type: "activity", maxPoints: 5 };
    expect(picturesOnScreen({ kind: "answer", questionId }, roundsWith(video, activity))).toEqual([file("still")]);
    expect(picturesOnScreen({ kind: "question", questionId }, roundsWith({ kind: "audio", storageId: file("song") }, activity))).toEqual([]);
  });

  it("gives none past the last screen or on a screen without pictures", () => {
    expect(picturesOnScreen(undefined, roundsWith(null))).toEqual([]);
    expect(picturesOnScreen({ kind: "rules" }, roundsWith(null))).toEqual([]);
  });
});
