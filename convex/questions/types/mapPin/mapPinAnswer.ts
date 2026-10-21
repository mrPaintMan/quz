import { v } from "convex/values";
import { coordinates } from "./mapPinContent";

export const mapPinAnswer = v.object({
  type: v.literal("mapPin"),
  pin: v.union(coordinates, v.null()),
});
