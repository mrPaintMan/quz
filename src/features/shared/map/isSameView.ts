import type { MapView } from "@/features/shared/map/mapView";

// About a metre: closer than this counts as the same place, so rounding never moves the map.
const COORDINATE_TOLERANCE = 1e-5;

export function isSameView(a: MapView, b: MapView): boolean {
  return (
    Math.abs(a.center.lat - b.center.lat) < COORDINATE_TOLERANCE &&
    Math.abs(a.center.lng - b.center.lng) < COORDINATE_TOLERANCE &&
    a.zoom === b.zoom
  );
}
