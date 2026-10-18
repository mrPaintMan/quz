import { v, type Infer } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

const coordinates = v.object({ lat: v.number(), lng: v.number() });
const mapView = v.object({ center: coordinates, zoom: v.number() });

export type Coordinates = Infer<typeof coordinates>;
export type MapView = Infer<typeof mapView>;

export const mapPinContent = v.object({
  type: v.literal("mapPin"),
  // null until the hosts place the target on the map.
  target: v.union(coordinates, v.null()),
  radiusMeters: numberOrNull,
  points: numberOrNull,
  initialView: mapView,
});
