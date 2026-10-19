import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { findQuestionProblems } from "./findQuestionProblems";

const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const drawing: QuestionContent = { type: "drawing", maxPoints: 3 };

const messagesFor = (question: Parameters<typeof findQuestionProblems>[0]) =>
  findQuestionProblems(question).map((problem) => problem.message);

describe("findQuestionProblems", () => {
  it("finds no problems in a complete question", () => {
    expect(messagesFor({ prompt: "Pepparkakshus", timeLimitSeconds: null, media: null, content: activity })).toEqual([]);
  });

  it("asks for the prompt shown on the TV", () => {
    expect(messagesFor({ prompt: " ", timeLimitSeconds: null, media: null, content: activity })).toEqual([
      "Skriv frågan som visas på TV:n.",
    ]);
  });

  it("asks for a time limit when the type requires one", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: null, media: null, content: drawing })).toEqual([
      "Den här frågetypen behöver en tidsgräns.",
    ]);
  });

  it("flags a time limit of zero", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: 0, media: null, content: drawing })).toEqual([
      "Tidsgränsen måste vara större än 0.",
    ]);
  });

  it("includes the problems of the question type", () => {
    expect(
      messagesFor({ prompt: "Pepparkakshus", timeLimitSeconds: null, media: null, content: { type: "activity", maxPoints: 0 } }),
    ).toEqual(["Maxpoängen måste vara större än 0."]);
  });

  describe("for a type that needs a film", () => {
    const trip: QuestionContent = { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: ["A", "B", "C", "D", "E"] };
    const storageId = "film" as Id<"_storage">;
    const video = (durationSeconds: number | null) => ({ kind: "video" as const, storageId, posterId: null, durationSeconds });
    const draft = (media: Parameters<typeof findQuestionProblems>[0]["media"]) => ({ prompt: "Vart är vi på väg?", timeLimitSeconds: null, media, content: trip });

    it("asks for the film", () => {
      expect(messagesFor(draft(null))).toEqual(["Lägg till filmen."]);
      expect(messagesFor(draft({ kind: "image", storageId }))).toEqual(["Lägg till filmen."]);
    });

    it("asks for the film again when its length couldn't be read", () => {
      expect(messagesFor(draft(video(null)))).toEqual(["Filmens längd kunde inte läsas. Ladda upp den igen."]);
    });

    it("is satisfied by a film with a known length", () => {
      expect(messagesFor(draft(video(120)))).toEqual([]);
    });
  });

  it("flags a time limit below 0", () => {
    expect(messagesFor({ prompt: "Rita en tomte", timeLimitSeconds: -5, media: null, content: drawing })).toEqual([
      "Tidsgränsen måste vara större än 0.",
    ]);
  });
});
