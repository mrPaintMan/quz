import { describe, expect, it } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { resolveSelection } from "./resolveSelection";

const question = (id: string) => ({ _id: id as Id<"questions"> }) as Doc<"questions">;
const round = (id: string, questionIds: string[]) =>
  ({ _id: id as Id<"rounds">, questions: questionIds.map(question) }) as Doc<"rounds"> & { questions: Doc<"questions">[] };

const rounds = [round("r1", ["q1", "q2"]), round("r2", ["q3"]), round("r3", [])];
const ids = (selection: ReturnType<typeof resolveSelection>) => [selection.round?._id ?? null, selection.question?._id ?? null];

describe("resolveSelection", () => {
  it("returns the selected round and question", () => {
    expect(ids(resolveSelection(rounds, "r1" as Id<"rounds">, "q2" as Id<"questions">))).toEqual(["r1", "q2"]);
  });

  it("falls back to the first round and its first question", () => {
    expect(ids(resolveSelection(rounds, null, null))).toEqual(["r1", "q1"]);
    expect(ids(resolveSelection(rounds, "gone" as Id<"rounds">, null))).toEqual(["r1", "q1"]);
  });

  it("falls back to the round's first question when the selected one is elsewhere or gone", () => {
    expect(ids(resolveSelection(rounds, "r2" as Id<"rounds">, "q1" as Id<"questions">))).toEqual(["r2", "q3"]);
  });

  it("has no question for an empty round and nothing for an empty quiz", () => {
    expect(ids(resolveSelection(rounds, "r3" as Id<"rounds">, null))).toEqual(["r3", null]);
    expect(ids(resolveSelection([], null, null))).toEqual([null, null]);
  });
});
