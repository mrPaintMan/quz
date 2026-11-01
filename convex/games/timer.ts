import { v, type Infer } from "convex/values";

// The countdown of the question showing now (D15): its end time while it runs, the time left
// while the hosts have paused it. Devices count down on their own clocks from these.
export const timer = v.union(
  v.object({ kind: v.literal("running"), endsAt: v.number() }),
  v.object({ kind: v.literal("paused"), remainingMs: v.number() }),
);

export type Timer = Infer<typeof timer>;
