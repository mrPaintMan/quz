import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import type { QuestionMedia } from "@convex/questions/table";
import type { Film } from "@convex/rounds/table";
import { mediaOnScreen } from "./mediaOnScreen";

const roundId = "r1" as Id<"rounds">;
const questionId = "q1" as Id<"questions">;
const file = "file1" as Id<"_storage">;
const still = "still1" as Id<"_storage">;
const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const trip: QuestionContent = { type: "paSparet", acceptedAnswers: ["Oslo"], fuzzy: true, clues: ["a", "b", "c", "d", "e"] };
const video: QuestionMedia = { kind: "video", r2Key: "film", posterId: still, durationSeconds: 20 };

const roundsWith = (media: QuestionMedia | null, content: QuestionContent = activity, films: Film[] = []) => [
  { _id: roundId, films, questions: [{ _id: questionId, media, content }] },
];

describe("mediaOnScreen", () => {
  it.each<QuestionMedia>([
    { kind: "image", storageId: file },
    { kind: "audio", storageId: file },
  ])("shows a question's %o", (media) => {
    expect(mediaOnScreen({ kind: "question", questionId }, roundsWith(media))).toEqual(media);
  });

  it("shows a question's video by its screen and still, leaving the film out", () => {
    const screen = { kind: "question" as const, questionId };
    expect(mediaOnScreen(screen, roundsWith(video))).toEqual({ kind: "video", screen, posterId: still, durationSeconds: 20, showsCluePoints: false });
  });

  it("shows no still on the trip's answer screen", () => {
    expect(mediaOnScreen({ kind: "answer", questionId }, roundsWith(video, trip))).toBeNull();
  });

  it("shows the clue points over the trip's film", () => {
    expect(mediaOnScreen({ kind: "question", questionId }, roundsWith(video, trip))).toMatchObject({ showsCluePoints: true });
  });

  it("plays a round's film on its film screen, without clue points", () => {
    const screen = { kind: "film" as const, roundId, filmId: "f1" };
    expect(mediaOnScreen(screen, roundsWith(null, activity, [{ id: "f1", video }]))).toEqual({
      kind: "video",
      screen,
      posterId: still,
      durationSeconds: 20,
      showsCluePoints: false,
    });
  });

  it("shows nothing for a film not uploaded yet", () => {
    expect(mediaOnScreen({ kind: "film", roundId, filmId: "f1" }, roundsWith(null, activity, [{ id: "f1", video: null }]))).toBeNull();
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
