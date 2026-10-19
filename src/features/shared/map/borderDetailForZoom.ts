// Natural Earth's three scales, coarsest first. world-atlas ships each as its own file.
export type BorderDetail = "110m" | "50m" | "10m";

// The zoom range 1–12 (MAP_ZOOM) split in three even bands, so detail grows as the map
// zooms in and the heaviest file is drawn only when someone zooms in far.
export function borderDetailForZoom(zoom: number): BorderDetail {
  if (zoom < 5) return "110m";
  if (zoom < 9) return "50m";
  return "10m";
}
