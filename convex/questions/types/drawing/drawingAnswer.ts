import { v } from "convex/values";

// The pens a team draws with (D62); the phones and the TV give each its shade.
export const penColour = v.union(v.literal("black"), v.literal("red"), v.literal("green"), v.literal("blue"), v.literal("orange"));

export const drawingAnswer = v.object({
  type: v.literal("drawing"),
  // Each stroke's pen and its points as x, y pairs in a row, scaled to 0–1 of a 4:3 canvas, so
  // drafts stay small and the TV can redraw it at any size.
  strokes: v.array(v.object({ colour: penColour, points: v.array(v.number()) })),
});
