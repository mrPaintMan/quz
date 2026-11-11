import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionContent } from "@convex/questions/questionContent";
import { screenNotes } from "./screenNotes";

const id = (value: string) => value as Id<"questions">;
const question = (value: string, content: QuestionContent, hostNotes: string) => ({ _id: id(value), hostNotes, content });
const rounds = [
  {
    questions: [
      question("q1", { type: "activity", maxPoints: 5 }, "  Säg att alla ska upp och dansa.  "),
      question("q2", { type: "number", answer: 9, scoring: { mode: "tiers", tiers: [{ within: 0, points: 3 }] } }, ""),
    ],
  },
];

describe("screenNotes", () => {
  it("gives the notes of the question a question or answer screen shows", () => {
    const notes = { questionId: "q1", notes: "Säg att alla ska upp och dansa.", scoring: null };
    expect(screenNotes({ kind: "question", questionId: id("q1") }, rounds)).toEqual(notes);
    expect(screenNotes({ kind: "answer", questionId: id("q1") }, rounds)).toEqual(notes);
  });

  it("explains how a Gissa siffran question scores", () => {
    expect(screenNotes({ kind: "question", questionId: id("q2") }, rounds)?.scoring).toEqual({
      kind: "Poängnivåer",
      rules: ["Exakt rätt: 3 p", "Bästa nivån räknas."],
    });
  });

  it("is null for other screens, past the last screen and for a question that is gone", () => {
    expect(screenNotes({ kind: "lobby" }, rounds)).toBeNull();
    expect(screenNotes(undefined, rounds)).toBeNull();
    expect(screenNotes({ kind: "question", questionId: id("borta") }, rounds)).toBeNull();
  });
});
