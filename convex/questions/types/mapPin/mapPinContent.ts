import { v } from "convex/values";

const coordinates = v.object({ lat: v.number(), lng: v.number() });

export const mapPinContent = v.object({
  type: v.literal("mapPin"),
  // null until the hosts place the target on the map.
  target: v.union(coordinates, v.null()),
  radiusMeters: v.number(),
  points: v.number(),
  initialView: v.object({ center: coordinates, zoom: v.number() }),
});
