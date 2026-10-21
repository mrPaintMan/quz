import { v } from "convex/values";

export const drawingAnswer = v.object({
  type: v.literal("drawing"),
  // Each stroke as x, y pairs in a row, scaled to 0–1 of the canvas, so drafts stay small
  // and the TV can redraw it at any size.
  strokes: v.array(v.array(v.number())),
});
