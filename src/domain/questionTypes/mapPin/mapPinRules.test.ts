import type { ContentOf } from "@convex/questions/questionContent";
import { describe, expect, it } from "vitest";
import { mapPinRules } from "./mapPinRules";

const kiruna = { lat: 67.85, lng: 20.23 };

const validContent: ContentOf<"mapPin"> = {
  type: "mapPin",
  target: kiruna,
  radiusMeters: 50000,
  points: 3,
  initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
};

const messagesFor = (content: ContentOf<"mapPin">) =>
  mapPinRules.findProblems(content).map((problem) => problem.message);

describe("mapPinRules", () => {
  it("gives the question's points as max points", () => {
    expect(mapPinRules.maxPoints(validContent)).toBe(3);
  });

  it("finds no problems in a complete question", () => {
    expect(messagesFor(validContent)).toEqual([]);
  });

  it.each([
    { lat: 91, lng: 0 },
    { lat: 0, lng: -181 },
  ])("flags a target off the map at %o", (target) => {
    expect(messagesFor({ ...validContent, target })).toEqual(["Placera målet på kartan."]);
  });

  it("flags a radius of zero", () => {
    expect(messagesFor({ ...validContent, radiusMeters: 0 })).toEqual(["Radien måste vara större än 0."]);
  });

  it("flags zero points", () => {
    expect(messagesFor({ ...validContent, points: 0 })).toEqual(["Poängen måste vara större än 0."]);
  });

  it("flags a starting view off the map", () => {
    const initialView = { center: { lat: 100, lng: 0 }, zoom: 4 };
    expect(messagesFor({ ...validContent, initialView })).toEqual(["Välj var kartan ska börja."]);
  });

  it.each([-1, 21, Number.NaN])("flags a starting zoom of %s", (zoom) => {
    const initialView = { ...validContent.initialView, zoom };
    expect(messagesFor({ ...validContent, initialView })).toEqual(["Välj en zoomnivå mellan 0 och 20."]);
  });

  it("flags a radius that is not a number", () => {
    expect(messagesFor({ ...validContent, radiusMeters: Number.NaN })).toEqual(["Radien måste vara större än 0."]);
  });

  it("asks for the target until it is placed", () => {
    expect(messagesFor({ ...validContent, target: null })).toEqual(["Placera målet på kartan."]);
  });
});
