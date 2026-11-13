import { describe, expect, it } from "vitest";
import { drawingAnswering } from "./drawingAnswering";

const content = { type: "drawing" as const, maxPoints: 3 };
const drawing = (points: number[]) => ({ type: "drawing" as const, strokes: [{ colour: "black" as const, points }] });
const team = (name: string) => ({ _id: name, name, colour: "red" as const });

describe("drawingAnswering", () => {
  it("shows nothing beyond the prompt while asked", () => {
    expect(drawingAnswering.show(content)).toEqual({ type: "drawing" });
  });

  it("reveals every team's drawing with its team", () => {
    const graded = { answers: [drawing([0.1, 0.2])], verdicts: [], teams: [team("Röda")] };
    expect(drawingAnswering.reveal(content, graded)).toEqual({
      type: "drawing",
      drawings: [{ teamId: "Röda", name: "Röda", colour: "red", strokes: [{ colour: "black", points: [0.1, 0.2] }] }],
    });
    expect(drawingAnswering.reveal(content)).toEqual({ type: "drawing", drawings: [] });
  });

  it("leaves out a paper that locked empty", () => {
    const graded = { answers: [{ type: "drawing" as const, strokes: [] }], verdicts: [], teams: [team("Röda")] };
    expect(drawingAnswering.reveal(content, graded).drawings).toEqual([]);
  });

  it("can be sent once something is drawn", () => {
    expect(drawingAnswering.isComplete({ type: "drawing" }, drawing([0.1, 0.2]))).toBe(true);
    expect(drawingAnswering.isComplete({ type: "drawing" }, { type: "drawing", strokes: [] })).toBe(false);
    expect(drawingAnswering.startingAnswer({ type: "drawing" })).toBeNull();
  });

  it("scores nothing itself, each drawing waiting for the hosts' points", () => {
    expect(drawingAnswering.outcomes(content, [drawing([0.1, 0.2])])).toEqual([
      { points: 0, parts: [{ label: "", given: "", result: "pending", correct: "", points: 0 }] },
    ]);
    expect(drawingAnswering.scoredByHand).toBe(true);
  });
});
