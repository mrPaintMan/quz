// Two of Natural Earth's scales; world-atlas ships each as its own file.
export type BorderDetail = "50m" | "10m";

// Zoomed out, 1:50m looks as good and is about a sixth of the points; from zoom 6 its
// coastlines turn visibly coarse, so the 1:10m file takes over.
export function borderDetailForZoom(zoom: number): BorderDetail {
  return zoom < 6 ? "50m" : "10m";
}
