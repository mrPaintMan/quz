import type { QuestionContent } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { findUnfinishedQuestions } from "./findUnfinishedQuestions";

const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const question = (prompt: string, filmId?: string) => ({ prompt, timeLimitSeconds: null, media: null, content: activity, filmId });
const film = { kind: "video" as const, r2Key: "films/bro", posterId: null, durationSeconds: 90 };

describe("findUnfinishedQuestions", () => {
  it("finds nothing when every question is filled in", () => {
    expect(findUnfinishedQuestions([{ questions: [question("Pepparkakshus")] }])).toEqual([]);
  });

  it("lists the unfinished questions of every round in order", () => {
    const blankA = question("");
    const blankB = question(" ");
    expect(findUnfinishedQuestions([{ questions: [blankA, question("Klar")] }, { questions: [blankB] }])).toEqual([blankA, blankB]);
  });

  it("counts a question after a film as unfinished until the film is uploaded", () => {
    const afterFilm = question("Vilken bro?", "f1");
    expect(findUnfinishedQuestions([{ films: [{ id: "f1", video: null }], questions: [afterFilm] }])).toEqual([afterFilm]);
    expect(findUnfinishedQuestions([{ films: [{ id: "f1", video: film }], questions: [afterFilm] }])).toEqual([]);
  });
});
