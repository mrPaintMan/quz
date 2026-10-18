import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it, vi } from "vitest";
import { loadBorderShapes, toBorderShapes } from "./loadBorderShapes";

// Two squares side by side sharing the middle arc (1), the way TopoJSON stores neighbours.
const twoCountries: Topology<{ countries: GeometryCollection }> = {
  type: "Topology",
  arcs: [
    [[1, 0], [0, 0], [0, 1], [1, 1]],
    [[1, 1], [1, 0]],
    [[1, 0], [2, 0], [2, 1], [1, 1]],
  ],
  objects: {
    countries: {
      type: "GeometryCollection",
      geometries: [
        { type: "Polygon", arcs: [[0, 1]] },
        { type: "Polygon", arcs: [[2, -2]] },
      ],
    },
  },
};

describe("toBorderShapes", () => {
  it("gives one land shape per country", () => {
    expect(toBorderShapes(twoCountries).land.features).toHaveLength(2);
  });

  it("draws only the borders between countries, not the coast", () => {
    expect(toBorderShapes(twoCountries).borders.coordinates).toEqual([[[1, 1], [1, 0]]]);
  });
});

describe("loadBorderShapes", () => {
  it("loads the world's countries once and reuses them", async () => {
    const first = loadBorderShapes();
    expect(loadBorderShapes()).toBe(first);
    expect((await first).land.features.length).toBeGreaterThan(200);
  });
});

describe("loadBorderShapes after a failed load", () => {
  it("tries again on the next call", async () => {
    vi.resetModules();
    vi.doMock("world-atlas/countries-50m.json", () => {
      throw new Error("offline");
    });
    const { loadBorderShapes: load } = await import("./loadBorderShapes");
    const failed = load();
    await expect(failed).rejects.toThrow();
    const retry = load();
    expect(retry).not.toBe(failed);
    await retry.catch(() => undefined);
    vi.doUnmock("world-atlas/countries-50m.json");
  });
});
