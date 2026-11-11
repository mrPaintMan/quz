import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it, vi } from "vitest";
import { loadBorderShapes, toBorderShapes } from "./loadBorderShapes";

// Tiny maps in place of the real world atlas, which takes seconds to load: tests stay fast, and
// the finer one has an extra country so the two can be told apart (D57).
vi.mock("world-atlas/countries-50m.json", () => ({ default: worldOf(2) }));
vi.mock("world-atlas/countries-10m.json", () => ({ default: worldOf(3) }));

// A row of square countries side by side.
function worldOf(count: number): Topology<{ countries: GeometryCollection }> {
  const arcs = Array.from({ length: count }, (_, index) => [
    [index, 0],
    [index + 1, 0],
    [index + 1, 1],
    [index, 1],
    [index, 0],
  ]);
  return {
    type: "Topology",
    arcs,
    objects: { countries: { type: "GeometryCollection", geometries: arcs.map((_, index) => ({ type: "Polygon", arcs: [[index]] })) } },
  };
}

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
  it("loads the world's countries once per detail and reuses them", async () => {
    const first = loadBorderShapes("50m");
    expect(loadBorderShapes("50m")).toBe(first);
    expect((await first).land.features).toHaveLength(2);
  });

  it("loads a finer detail as a separate set of shapes", async () => {
    const [coarse, fine] = await Promise.all([loadBorderShapes("50m"), loadBorderShapes("10m")]);
    expect(fine).not.toBe(coarse);
    expect(fine.land.features).toHaveLength(3);
  });
});

describe("loadBorderShapes after a failed load", () => {
  it("tries again on the next call", async () => {
    vi.resetModules();
    vi.doMock("world-atlas/countries-10m.json", () => {
      throw new Error("offline");
    });
    const { loadBorderShapes: load } = await import("./loadBorderShapes");
    const failed = load("10m");
    await expect(failed).rejects.toThrow();
    const retry = load("10m");
    expect(retry).not.toBe(failed);
    await retry.catch(() => undefined);
    vi.doUnmock("world-atlas/countries-10m.json");
  });
});
