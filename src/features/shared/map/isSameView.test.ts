import { describe, expect, it } from "vitest";
import { isSameView } from "./isSameView";

const view = { center: { lat: 59.33, lng: 18.07 }, zoom: 5 };

describe("isSameView", () => {
  it("treats a centre less than a metre away as the same view", () => {
    expect(isSameView(view, { ...view, center: { lat: 59.330001, lng: 18.070001 } })).toBe(true);
  });

  it("tells views apart by centre", () => {
    expect(isSameView(view, { ...view, center: { lat: 59.4, lng: 18.07 } })).toBe(false);
    expect(isSameView(view, { ...view, center: { lat: 59.33, lng: 18.1 } })).toBe(false);
  });

  it("tells views apart by zoom", () => {
    expect(isSameView(view, { ...view, zoom: 5.25 })).toBe(false);
  });
});
