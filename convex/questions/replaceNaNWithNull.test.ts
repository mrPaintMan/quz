import { describe, expect, it } from "vitest";
import { replaceNaNWithNull } from "./replaceNaNWithNull";

describe("replaceNaNWithNull", () => {
  it("replaces every NaN with null and keeps the rest", () => {
    const question = {
      timeLimitSeconds: Number.NaN,
      content: {
        type: "number" as const,
        answer: 42,
        scoring: { mode: "tiers" as const, tiers: [{ within: 0, points: 3 }, { within: Number.NaN, points: Number.NaN }] },
      },
    };
    expect(replaceNaNWithNull(question)).toEqual({
      timeLimitSeconds: null,
      content: {
        type: "number",
        answer: 42,
        scoring: { mode: "tiers", tiers: [{ within: 0, points: 3 }, { within: null, points: null }] },
      },
    });
  });

  it("unplaces a map target with a half-typed coordinate", () => {
    const content = {
      type: "mapPin" as const,
      target: { lat: 67, lng: Number.NaN },
      radiusMeters: 50_000,
      points: 1,
      initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
    };
    expect(replaceNaNWithNull({ timeLimitSeconds: null, content }).content).toEqual({ ...content, target: null });
  });
});
