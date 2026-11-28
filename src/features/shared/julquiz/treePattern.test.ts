import { describe, expect, it } from "vitest";
import { treePatternImage, treeTileHeight } from "./treePattern";

describe("treeTileHeight", () => {
  it("keeps the tile's shape at any width", () => {
    expect(treeTileHeight(96)).toBe(68);
    expect(treeTileHeight(48)).toBe(34);
  });
});

describe("treePatternImage", () => {
  it("is one tile of two trees, the second upside down", () => {
    const svg = decodeURIComponent(treePatternImage);
    expect(svg.match(/<path/g)).toHaveLength(2);
    expect(svg).toContain("rotate(180");
  });
});
