import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionMedia } from "@convex/questions/table";
import { mediaOnScreen } from "./mediaOnScreen";

const questionId = "q1" as Id<"questions">;
const file = "file1" as Id<"_storage">;
const still = "still1" as Id<"_storage">;
const roundsWith = (media: QuestionMedia | null) => [{ questions: [{ _id: questionId, media }] }];
const video: QuestionMedia = { kind: "video", r2Key: "film", posterId: still, durationSeconds: 20 };

describe("mediaOnScreen", () => {
  it.each<QuestionMedia>([
    { kind: "image", storageId: file },
    { kind: "audio", storageId: file },
  ])("shows a question's %o", (media) => {
    expect(mediaOnScreen({ kind: "question", questionId }, roundsWith(media))).toEqual(media);
  });

  it("shows a question's video by its still, leaving the film out", () => {
    expect(mediaOnScreen({ kind: "question", questionId }, roundsWith(video))).toEqual({ kind: "video", questionId, posterId: still });
  });

  it("shows the picture again with the answer", () => {
    expect(mediaOnScreen({ kind: "answer", questionId }, roundsWith({ kind: "image", storageId: file }))).toEqual({ kind: "image", storageId: file });
  });

  it("shows a video's still with the answer", () => {
    expect(mediaOnScreen({ kind: "answer", questionId }, roundsWith(video))).toEqual({ kind: "image", storageId: still });
  });

  it.each<QuestionMedia>([
    { kind: "audio", storageId: file },
    { ...video, posterId: null },
  ])("shows nothing with the answer for %o", (media) => {
    expect(mediaOnScreen({ kind: "answer", questionId }, roundsWith(media))).toBeNull();
  });

  it("shows nothing for a question without media", () => {
    expect(mediaOnScreen({ kind: "question", questionId }, roundsWith(null))).toBeNull();
  });

  it("shows nothing on other screens", () => {
    expect(mediaOnScreen({ kind: "rules" }, roundsWith(video))).toBeNull();
  });
});
