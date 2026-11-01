import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import { tripOnScreen } from "./tripOnScreen";

const questionId = "q1" as Id<"questions">;
const clues = ["Fjord", "Kung", "Vasaloppet", "Munch", "Karl Johan"];
const trip: QuestionContent = { type: "paSparet", acceptedAnswers: ["Oslo"], fuzzy: true, clues };
const film = { kind: "video" as const, r2Key: "resa", posterId: null, durationSeconds: 120 };
const roundsWith = (content: QuestionContent, media: typeof film | null = film) => [{ questions: [{ _id: questionId, media, content }] }];

describe("tripOnScreen", () => {
  it("gives the trip's clues and film length while the trip shows", () => {
    expect(tripOnScreen({ kind: "question", questionId }, roundsWith(trip))).toEqual({ clues, durationSeconds: 120 });
  });

  it("has no length for a trip without its film", () => {
    expect(tripOnScreen({ kind: "question", questionId }, roundsWith(trip, null))).toEqual({ clues, durationSeconds: null });
  });

  it("is null for another question or screen", () => {
    expect(tripOnScreen({ kind: "question", questionId }, roundsWith({ type: "activity", maxPoints: 5 }))).toBeNull();
    expect(tripOnScreen({ kind: "answer", questionId }, roundsWith(trip))).toBeNull();
  });
});
