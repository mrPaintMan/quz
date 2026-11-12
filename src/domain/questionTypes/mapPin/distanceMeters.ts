import type { Coordinates } from "@convex/questions/types/mapPin/mapPinContent";

// The Earth's mean radius; good to a few tenths of a percent, plenty for a quiz.
const EARTH_RADIUS_METERS = 6_371_000;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

// The shortest distance between two points over the Earth's surface (the haversine formula).
export function distanceMeters(from: Coordinates, to: Coordinates): number {
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

// A distance as people say it: "800 m", "1,2 km", "12 km", rounded so it reads at a glance.
export function formatDistance(meters: number): string {
  // Rounded first, so 997 m reads "1 km" rather than "1000 m".
  const tens = Math.round(meters / 10) * 10;
  if (tens < 1000) return `${tens} m`;
  const tenths = Math.round(meters / 100) / 10;
  if (tenths < 10) return `${tenths.toString().replace(".", ",")} km`;
  return `${Math.round(meters / 1000).toLocaleString("sv-SE")} km`;
}
