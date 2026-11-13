import type { AnswerOf } from "@convex/answers/answerContent";

type Drawing = AnswerOf<"drawing">;

// The most strokes, and points in all, one drawing may hold: plenty for a phone sketch, and it keeps
// an answer small enough for every screen that shows it (D62).
export const MAX_STROKES = 300;
export const MAX_DRAWING_POINTS = 3000;

const pointCount = (drawing: Drawing) => drawing.strokes.reduce((sum, stroke) => sum + stroke.points.length / 2, 0);

// Whether a drawing stays within those bounds, each stroke made of whole points inside the canvas.
export function fitsDrawingLimits(drawing: Drawing): boolean {
  return (
    drawing.strokes.length <= MAX_STROKES &&
    pointCount(drawing) <= MAX_DRAWING_POINTS &&
    drawing.strokes.every(({ points }) => points.length >= 2 && points.length % 2 === 0 && points.every((value) => value >= 0 && value <= 1))
  );
}

// How many more points the drawing has room for.
export const pointsLeft = (drawing: Drawing) => MAX_DRAWING_POINTS - pointCount(drawing);
