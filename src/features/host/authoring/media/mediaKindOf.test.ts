import { describe, expect, it } from "vitest";
import { mediaKindOf } from "./mediaKindOf";

describe("mediaKindOf", () => {
  it.each([
    ["image/png", "image"],
    ["audio/mpeg", "audio"],
    ["video/mp4", "video"],
    ["application/pdf", null],
    ["", null],
  ])("treats %j as %j", (mimeType, kind) => {
    expect(mediaKindOf(mimeType)).toBe(kind);
  });
});
