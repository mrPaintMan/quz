import { describe, expect, it } from "vitest";
import type { Doc, Id } from "../_generated/dataModel";
import { screenNotes } from "./screenNotes";

const question = (id: string, content: Doc<"questions">["content"], hostNotes: string) =>
  ({ _id: id as Id<"questions">, hostNotes, content }) as Doc<"questions">;
const rounds = [
  {
    questions: [
      question("q1", { type: "activity", maxPoints: 5 }, "  Säg att alla ska upp och dansa.  "),
      question("q2", { type: "number", answer: 9, scoring: { mode: "tiers", tiers: [{ within: 0, points: 3 }] } }, ""),
    ],
  },
] as unknown as Parameters<typeof screenNotes>[1];

describe("screenNotes", () => {
  it("gives the notes of the question a question or answer screen shows", () => {
    const notes = { questionId: "q1", notes: "Säg att alla ska upp och dansa.", scoring: null };
    expect(screenNotes({ kind: "question", questionId: "q1" as Id<"questions"> }, rounds)).toEqual(notes);
    expect(screenNotes({ kind: "answer", questionId: "q1" as Id<"questions"> }, rounds)).toEqual(notes);
  });

  it("explains how a Gissa siffran question scores", () => {
    expect(screenNotes({ kind: "question", questionId: "q2" as Id<"questions"> }, rounds)?.scoring).toEqual([
      "Poängnivåer",
      "Exakt rätt: 3 p",
      "Bästa nivån räknas.",
    ]);
  });

  it("is null for other screens, past the last screen and for a question that is gone", () => {
    expect(screenNotes({ kind: "lobby" }, rounds)).toBeNull();
    expect(screenNotes(undefined, rounds)).toBeNull();
    expect(screenNotes({ kind: "question", questionId: "borta" as Id<"questions"> }, rounds)).toBeNull();
  });
});
