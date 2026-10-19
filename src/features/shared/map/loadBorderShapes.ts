import type { FeatureCollection, MultiLineString } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { BorderDetail } from "@/features/shared/map/borderDetailForZoom";
import { unwrapGeometry } from "@/features/shared/map/unwrapGeometry";

export type BorderShapes = {
  land: FeatureCollection;
  borders: MultiLineString;
};

type CountriesTopology = Topology<{ countries: GeometryCollection }>;

// Each scale is its own chunk, fetched the first time a map zooms into its band.
const topologies: Record<BorderDetail, () => Promise<{ default: unknown }>> = {
  "110m": () => import("world-atlas/countries-110m.json"),
  "50m": () => import("world-atlas/countries-50m.json"),
  "10m": () => import("world-atlas/countries-10m.json"),
};

const loaded = new Map<BorderDetail, Promise<BorderShapes>>();

export function toBorderShapes(topology: CountriesTopology): BorderShapes {
  const countries = topology.objects.countries;
  const land = feature(topology, countries) as FeatureCollection;
  return {
    land: {
      ...land,
      features: land.features.map((country) => country.geometry ? { ...country, geometry: unwrapGeometry(country.geometry) } : country),
    },
    // Only lines shared by two countries; coastlines come from the land outline.
    borders: unwrapGeometry(mesh(topology, countries, (a, b) => a !== b)) as MultiLineString,
  };
}

// Natural Earth (public domain): about 110 kB at 1:110m, 750 kB at 1:50m and 3.7 MB at
// 1:10m before compression, so each is loaded only when a map needs it and then kept for
// every later map.
export function loadBorderShapes(detail: BorderDetail): Promise<BorderShapes> {
  const cached = loaded.get(detail);
  if (cached) return cached;
  const loading = topologies[detail]()
    .then((module) => toBorderShapes(module.default as CountriesTopology))
    .catch((error: unknown) => {
      // Forget the failure, so the next map tries again.
      loaded.delete(detail);
      throw error;
    });
  loaded.set(detail, loading);
  return loading;
}
