import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { buildScreenSequence } from "./buildScreenSequence";

const roundId = (id: string) => id as Id<"rounds">;
const questionId = (id: string) => id as Id<"questions">;
const freeText: QuestionContent = { type: "freeText", fields: [], pointsPerField: 1, fuzzy: true };
const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const question = (id: string, content: QuestionContent = freeText, filmId?: string) => ({ _id: questionId(id), content, filmId });

describe("buildScreenSequence", () => {
  it("opens with the lobby and rules and ends with the final leaderboard", () => {
    expect(buildScreenSequence([])).toEqual([{ kind: "lobby" }, { kind: "rules" }, { kind: "finalLeaderboard" }]);
  });

  it("introduces each round, shows each question and then its answer, with a leaderboard between rounds", () => {
    const rounds = [
      { _id: roundId("julmat"), questions: [question("q1"), question("q2")] },
      { _id: roundId("julfilm"), questions: [question("q3")] },
    ];
    expect(buildScreenSequence(rounds).slice(2)).toEqual([
      { kind: "roundIntro", roundId: "julmat" },
      { kind: "question", questionId: "q1" },
      { kind: "answer", questionId: "q1" },
      { kind: "question", questionId: "q2" },
      { kind: "answer", questionId: "q2" },
      { kind: "leaderboard", roundId: "julmat" },
      { kind: "roundIntro", roundId: "julfilm" },
      { kind: "question", questionId: "q3" },
      { kind: "answer", questionId: "q3" },
      { kind: "finalLeaderboard" },
    ]);
  });

  it("gives an activity no answer screen", () => {
    const rounds = [{ _id: roundId("lek"), questions: [question("pepparkakshus", activity)] }];
    expect(buildScreenSequence(rounds).slice(2)).toEqual([
      { kind: "roundIntro", roundId: "lek" },
      { kind: "question", questionId: "pepparkakshus" },
      { kind: "finalLeaderboard" },
    ]);
  });

  it("leaves out rounds without questions", () => {
    const rounds = [
      { _id: roundId("tom"), questions: [] },
      { _id: roundId("julmat"), questions: [question("q1")] },
      { _id: roundId("tom2"), questions: [] },
    ];
    expect(buildScreenSequence(rounds).slice(2)).toEqual([
      { kind: "roundIntro", roundId: "julmat" },
      { kind: "question", questionId: "q1" },
      { kind: "answer", questionId: "q1" },
      { kind: "finalLeaderboard" },
    ]);
  });

  it("plays each film of a På spåret round before its questions, after the trip", () => {
    const trip: QuestionContent = { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: true, clues: [] };
    const rounds = [
      {
        _id: roundId("paSparet"),
        questions: [question("resa", trip), question("bro", freeText, "f1"), question("tag", freeText, "f1"), question("kyrka", freeText, "f2")],
      },
    ];
    expect(buildScreenSequence(rounds).slice(2)).toEqual([
      { kind: "roundIntro", roundId: "paSparet" },
      { kind: "question", questionId: "resa" },
      { kind: "answer", questionId: "resa" },
      { kind: "film", roundId: "paSparet", filmId: "f1" },
      { kind: "question", questionId: "bro" },
      { kind: "answer", questionId: "bro" },
      { kind: "question", questionId: "tag" },
      { kind: "answer", questionId: "tag" },
      { kind: "film", roundId: "paSparet", filmId: "f2" },
      { kind: "question", questionId: "kyrka" },
      { kind: "answer", questionId: "kyrka" },
      { kind: "finalLeaderboard" },
    ]);
  });
});
