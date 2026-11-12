import { describe, expect, it } from "vitest";
import { resultViews } from "./registry";

describe("resultViews", () => {
  it("has a result view for every type answered in the app so far", () => {
    expect(Object.entries(resultViews).filter(([, view]) => view === null).map(([type]) => type)).toEqual(["drawing", "mapPin", "paSparet"]);
  });
});
