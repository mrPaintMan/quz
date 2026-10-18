import { describe, expect, it } from "vitest";
import { unwrapGeometry } from "./unwrapGeometry";

const unwrapLine = (coordinates: number[][]) => {
  const geometry = unwrapGeometry({ type: "LineString", coordinates });
  return geometry.type === "LineString" ? geometry.coordinates : null;
};

describe("unwrapGeometry on a line", () => {
  it("leaves a line that never crosses the 180° meridian alone", () => {
    expect(unwrapLine([[10, 50], [20, 55]])).toEqual([[10, 50], [20, 55]]);
  });

  it("keeps a line crossing the 180° meridian in one piece", () => {
    expect(unwrapLine([[178, 65], [-179, 66], [-175, 67]])).toEqual([[178, 65], [181, 66], [185, 67]]);
  });

  it("handles a crossing westwards", () => {
    expect(unwrapLine([[-179, -17], [179, -16]])).toEqual([[-179, -17], [-181, -16]]);
  });
});

describe("unwrapGeometry", () => {
  it("unwraps every line of a multi-line", () => {
    const geometry = unwrapGeometry({ type: "MultiLineString", coordinates: [[[179, 0], [-179, 0]]] });
    expect(geometry).toEqual({ type: "MultiLineString", coordinates: [[[179, 0], [181, 0]]] });
  });

  it("unwraps a single line", () => {
    expect(unwrapGeometry({ type: "LineString", coordinates: [[179, 0], [-179, 0]] })).toEqual({
      type: "LineString",
      coordinates: [[179, 0], [181, 0]],
    });
  });

  it("keeps an island ring that crosses the meridian closed where it started", () => {
    const ring = [[179, -16], [-179, -16], [-179, -18], [179, -18], [179, -16]];
    expect(unwrapGeometry({ type: "Polygon", coordinates: [ring] })).toEqual({
      type: "Polygon",
      coordinates: [[[179, -16], [181, -16], [181, -18], [179, -18], [179, -16]]],
    });
  });

  it("closes a ring around the pole along the bottom edge", () => {
    const ring = [[-180, -70], [-60, -72], [60, -70], [180, -70]];
    const geometry = unwrapGeometry({ type: "MultiPolygon", coordinates: [[ring]] });
    expect(geometry).toEqual({
      type: "MultiPolygon",
      coordinates: [[[...ring, [180, -90], [-180, -90], [-180, -70]]]],
    });
  });

  it("leaves points alone", () => {
    expect(unwrapGeometry({ type: "Point", coordinates: [200, 0] })).toEqual({ type: "Point", coordinates: [200, 0] });
  });
});
