import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { describeScreen } from "./describeScreen";

const freeText: QuestionContent = { type: "freeText", fields: [{ label: "", acceptedAnswers: ["kanel"] }], pointsPerField: 1, fuzzy: true };
const list: QuestionContent = { type: "list", acceptedItems: [], pointsPerItem: 1, fuzzy: true, aiAssist: false };
const activity: QuestionContent = { type: "activity", maxPoints: 5 };
const roundId = (id: string) => id as Id<"rounds">;
const questionId = (id: string) => id as Id<"questions">;
const rounds = [
  { _id: roundId("tom"), title: "Tom omgång", questions: [] },
  {
    _id: roundId("julmat"),
    title: "Julmat",
    questions: [
      { _id: questionId("q1"), prompt: "Vilken krydda?", content: freeText },
      { _id: questionId("q2"), prompt: "Baka ett pepparkakshus", content: activity },
    ],
  },
  { _id: roundId("julfilm"), title: "Julfilm", questions: [{ _id: questionId("q3"), prompt: "Nämn julfilmer", content: list }] },
];

describe("describeScreen", () => {
  it("describes the lobby and the final leaderboard by their kind alone", () => {
    expect(describeScreen({ kind: "lobby" }, rounds)).toEqual({ kind: "lobby" });
    expect(describeScreen({ kind: "finalLeaderboard" }, rounds)).toEqual({ kind: "finalLeaderboard" });
  });

  it("counts the rounds, questions and activities for the rules, skipping empty rounds", () => {
    expect(describeScreen({ kind: "rules" }, rounds)).toEqual({ kind: "rules", roundCount: 2, questionCount: 3, activityCount: 1 });
  });

  it("numbers rounds as the night plays them, without empty rounds", () => {
    expect(describeScreen({ kind: "roundIntro", roundId: roundId("julfilm") }, rounds)).toEqual({
      kind: "roundIntro",
      roundNumber: 2,
      title: "Julfilm",
    });
    expect(describeScreen({ kind: "leaderboard", roundId: roundId("julmat") }, rounds)).toEqual({ kind: "leaderboard", roundNumber: 1 });
    expect(describeScreen({ kind: "film", roundId: roundId("julfilm"), filmId: "f1" }, rounds)).toEqual({ kind: "film", roundNumber: 2 });
  });

  it("gives a question's place and prompt but no answer, and says whether teams answer it in the app", () => {
    expect(describeScreen({ kind: "question", questionId: questionId("q2") }, rounds)).toEqual({
      kind: "question",
      roundNumber: 1,
      questionNumber: 2,
      prompt: "Baka ett pepparkakshus",
      answeredInApp: false,
      shown: null,
    });
    expect(describeScreen({ kind: "answer", questionId: questionId("q3") }, rounds)).toEqual({
      kind: "answer",
      roundNumber: 2,
      questionNumber: 1,
      prompt: "Nämn julfilmer",
      revealed: null,
    });
  });

  it("shows a built type's question without its answer, and reveals it on the answer screen", () => {
    const options = [{ text: "Sverige", imageId: null }, { text: "Norge", imageId: null }];
    const choice: QuestionContent = { type: "multipleChoice", options, correctIndex: 1, points: 1 };
    const quiz = [{ _id: roundId("flerval"), title: "Flerval", questions: [{ _id: questionId("mc"), prompt: "Vilket land?", content: choice }] }];
    expect(describeScreen({ kind: "question", questionId: questionId("mc") }, quiz)).toMatchObject({ shown: { type: "multipleChoice", options } });
    expect(describeScreen({ kind: "answer", questionId: questionId("mc") }, quiz)).toMatchObject({
      revealed: { type: "multipleChoice", options, correctIndex: 1 },
    });
  });

  it("refuses a screen whose round or question isn't in the quiz", () => {
    expect(() => describeScreen({ kind: "roundIntro", roundId: roundId("borta") }, rounds)).toThrow();
    expect(() => describeScreen({ kind: "question", questionId: questionId("borta") }, rounds)).toThrow();
  });
});
