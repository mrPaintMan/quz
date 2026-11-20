import type { FeatureCollection, MultiLineString } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { BorderDetail } from "@/features/shared/map/borderDetailForZoom";
import { unwrapGeometry } from "@/features/shared/map/unwrapGeometry";

export type BorderShapes = {
  land: FeatureCollection;
  borders: MultiLineString;
  // The lines between Sweden's landskap and between the US states (D69).
  regions: MultiLineString;
};

type CountriesTopology = Topology<{ countries: GeometryCollection }>;
type RegionsTopology = Topology<{ regions: GeometryCollection }>;

// Each scale is its own chunk, fetched the first time a map zooms into its range. The finer one
// is a lighter copy of Natural Earth's 1:10m, built by scripts/buildMapData.mjs (D69).
const topologies: Record<BorderDetail, () => Promise<{ default: unknown }>> = {
  "50m": () => import("world-atlas/countries-50m.json"),
  "10m": () => import("@/features/shared/map/data/countries-10m-light.json"),
};

const loaded = new Map<string, Promise<unknown>>();

// Loads something once and keeps it for every later map; a failure is forgotten, so the next
// map tries again.
function loadOnce<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cached = loaded.get(key);
  if (cached) return cached as Promise<T>;
  const loading = load().catch((error: unknown) => {
    loaded.delete(key);
    throw error;
  });
  loaded.set(key, loading);
  return loading;
}

export function toBorderShapes(topology: CountriesTopology, regions: MultiLineString): BorderShapes {
  const countries = topology.objects.countries;
  const land = feature(topology, countries) as FeatureCollection;
  return {
    land: {
      ...land,
      features: land.features.map((country) => country.geometry ? { ...country, geometry: unwrapGeometry(country.geometry) } : country),
    },
    // Only lines shared by two countries; coastlines come from the land outline.
    borders: unwrapGeometry(mesh(topology, countries, (a, b) => a !== b)) as MultiLineString,
    regions,
  };
}

// The file holds only the lines between regions, so every line is drawn.
export function toRegionLines(topology: RegionsTopology): MultiLineString {
  return unwrapGeometry(mesh(topology, topology.objects.regions)) as MultiLineString;
}

// About 14 kB compressed, shared by both details.
const loadRegionLines = () =>
  loadOnce("regions", () => import("@/features/shared/map/data/regions.json").then((module) => toRegionLines(module.default as unknown as RegionsTopology)));

// Natural Earth (public domain): about 240 kB at 1:50m and 340 kB for the lighter 1:10m,
// compressed, so each is loaded only when a map needs it and then kept for every later map.
export function loadBorderShapes(detail: BorderDetail): Promise<BorderShapes> {
  return loadOnce(detail, () =>
    Promise.all([topologies[detail](), loadRegionLines()]).then(([module, regions]) => toBorderShapes(module.default as CountriesTopology, regions)),
  );
}
