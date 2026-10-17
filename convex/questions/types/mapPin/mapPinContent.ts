import { v } from "convex/values";

const coordinates = v.object({ lat: v.number(), lng: v.number() });

export const mapPinContent = v.object({
  type: v.literal("mapPin"),
  target: coordinates,
  radiusMeters: v.number(),
  points: v.number(),
  initialView: v.object({ center: coordinates, zoom: v.number() }),
});
