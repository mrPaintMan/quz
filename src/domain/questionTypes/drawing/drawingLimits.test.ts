import { describe, expect, it } from "vitest";
import { fitsDrawingLimits, MAX_DRAWING_POINTS, MAX_STROKES, pointsLeft } from "./drawingLimits";

const strokes = (count: number, points: number[]) => ({ type: "drawing" as const, strokes: Array.from({ length: count }, () => ({ colour: "red" as const, points })) });

describe("fitsDrawingLimits", () => {
  it("accepts strokes of whole points inside the canvas", () => {
    expect(fitsDrawingLimits(strokes(2, [0, 0, 1, 1]))).toBe(true);
  });

  it("refuses a stroke without a whole point, or a point outside the canvas", () => {
    expect(fitsDrawingLimits(strokes(1, []))).toBe(false);
    expect(fitsDrawingLimits(strokes(1, [0.1, 0.2, 0.3]))).toBe(false);
    expect(fitsDrawingLimits(strokes(1, [0.1, 1.2]))).toBe(false);
  });

  it("refuses too many strokes or points", () => {
    expect(fitsDrawingLimits(strokes(MAX_STROKES + 1, [0.1, 0.2]))).toBe(false);
    expect(fitsDrawingLimits(strokes(1, Array.from({ length: (MAX_DRAWING_POINTS + 1) * 2 }, () => 0.5)))).toBe(false);
  });
});

describe("pointsLeft", () => {
  it("counts the points the drawing still has room for", () => {
    expect(pointsLeft(strokes(2, [0, 0, 1, 1]))).toBe(MAX_DRAWING_POINTS - 4);
  });
});
