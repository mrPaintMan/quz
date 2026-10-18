import type { FeatureCollection, MultiLineString } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { unwrapGeometry } from "@/features/shared/map/unwrapGeometry";

export type BorderShapes = {
  land: FeatureCollection;
  borders: MultiLineString;
};

type CountriesTopology = Topology<{ countries: GeometryCollection }>;

let shapes: Promise<BorderShapes> | null = null;

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

// Natural Earth 1:50m (public domain), about 750 kB, so it is loaded only when a map is
// shown and then kept for every later map.
export function loadBorderShapes(): Promise<BorderShapes> {
  shapes ??= import("world-atlas/countries-50m.json")
    .then((module) => toBorderShapes(module.default as unknown as CountriesTopology))
    .catch((error: unknown) => {
      // Forget the failure, so the next map tries again.
      shapes = null;
      throw error;
    });
  return shapes;
}
