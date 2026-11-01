import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { VideoMedia } from "@convex/questions/table";
import { videoPlayedOn } from "./videoPlayedOn";

const roundId = "r1" as Id<"rounds">;
const questionId = "q1" as Id<"questions">;
const tripFilm: VideoMedia = { kind: "video", r2Key: "resa", posterId: null, durationSeconds: 120 };
const cityFilm: VideoMedia = { kind: "video", r2Key: "stad", posterId: null, durationSeconds: 30 };
const rounds = [
  {
    _id: roundId,
    films: [{ id: "f1", video: cityFilm }, { id: "f2", video: null }],
    questions: [{ _id: questionId, media: tripFilm }],
  },
];

describe("videoPlayedOn", () => {
  it("plays a question's video on its question screen", () => {
    expect(videoPlayedOn({ kind: "question", questionId }, rounds)).toBe(tripFilm);
  });

  it("plays a round's film on its film screen", () => {
    expect(videoPlayedOn({ kind: "film", roundId, filmId: "f1" }, rounds)).toBe(cityFilm);
  });

  it("plays nothing for a film not uploaded, a question without video or another screen", () => {
    expect(videoPlayedOn({ kind: "film", roundId, filmId: "f2" }, rounds)).toBeNull();
    expect(videoPlayedOn({ kind: "question", questionId }, [{ ...rounds[0], questions: [{ _id: questionId, media: null }] }])).toBeNull();
    expect(videoPlayedOn({ kind: "answer", questionId }, rounds)).toBeNull();
  });
});
