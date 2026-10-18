import type { Geometry, Position } from "geojson";

const HALF_TURN = 180;
const FULL_TURN = 360;
const SOUTH_POLE = -90;

// The world data joins shapes across the 180° meridian, so a coast can jump from 179° to
// -179°. Leaflet would draw that jump as a line across the whole world; shifting the rest
// of the line by 360° keeps the shape in one piece (it then reaches past 180°).
export function unwrapLine(line: Position[]): Position[] {
  const unwrapped: Position[] = [];
  for (const [lng, lat] of line) {
    const previous = unwrapped.at(-1)?.[0] ?? lng;
    const turns = Math.round((previous - lng) / FULL_TURN);
    unwrapped.push([lng + turns * FULL_TURN, lat]);
  }
  return unwrapped;
}

// A ring around the pole (Antarctica) can't close without crossing the whole map,
// so it closes along the bottom edge instead.
function unwrapRing(ring: Position[]): Position[] {
  const unwrapped = unwrapLine(ring);
  const first = unwrapped[0];
  const last = unwrapped.at(-1);
  if (!first || !last || Math.abs(last[0] - first[0]) < HALF_TURN) return unwrapped;
  return [...unwrapped, [last[0], SOUTH_POLE], [first[0], SOUTH_POLE], first];
}

export function unwrapGeometry(geometry: Geometry): Geometry {
  switch (geometry.type) {
    case "LineString":
      return { ...geometry, coordinates: unwrapLine(geometry.coordinates) };
    case "MultiLineString":
      return { ...geometry, coordinates: geometry.coordinates.map(unwrapLine) };
    case "Polygon":
      return { ...geometry, coordinates: geometry.coordinates.map(unwrapRing) };
    case "MultiPolygon":
      return { ...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map(unwrapRing)) };
    default:
      return geometry;
  }
}
