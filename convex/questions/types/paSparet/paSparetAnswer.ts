import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const paSparetAnswer = v.object({
  type: v.literal("paSparet"),
  guess: v.string(),
  // The clue showing when the team pulled the brake, set by the server from the film's position.
  brakeClueIndex: numberOrNull,
});
