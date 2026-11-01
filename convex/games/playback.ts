import { v, type Infer } from "convex/values";

// Where the clip of the question showing now is: while it plays, when its start was (so any TV
// works out the spot from its clock, even after a reload); while paused, the spot it stopped at.
export const playback = v.union(
  v.object({ kind: v.literal("playing"), startedAt: v.number() }),
  v.object({ kind: v.literal("paused"), positionMs: v.number() }),
);

export type Playback = Infer<typeof playback>;
