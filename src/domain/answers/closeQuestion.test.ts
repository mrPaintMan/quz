import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { closeQuestion } from "./closeQuestion";

const first = "q1" as Id<"questions">;
const second = "q2" as Id<"questions">;

describe("closeQuestion", () => {
  it("adds the question to the closed ones", () => {
    expect(closeQuestion(undefined, first)).toEqual([first]);
    expect(closeQuestion([first], second)).toEqual([first, second]);
  });

  it("lists a question only once", () => {
    expect(closeQuestion([first], first)).toEqual([first]);
  });
});
