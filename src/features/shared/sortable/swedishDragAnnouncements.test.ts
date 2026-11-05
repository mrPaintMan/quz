import type { Active, Over } from "@dnd-kit/core";
import { describe, expect, it } from "vitest";
import { swedishDragAnnouncements } from "./swedishDragAnnouncements";

const announce = swedishDragAnnouncements(
  (id) => `omgång ${id}`,
  (id) => Number(id),
);
// Only the id is read, so the rest of dnd-kit's objects can be left out.
const active = { id: "1" } as Active;
const over = { id: "3" } as Over;

describe("swedishDragAnnouncements", () => {
  it("names the row and the place it is over or dropped on", () => {
    expect(announce.onDragStart({ active })).toBe("Lyfte omgång 1.");
    expect(announce.onDragOver({ active, over })).toBe("omgång 1 är över plats 3.");
    expect(announce.onDragEnd({ active, over })).toBe("omgång 1 släpptes på plats 3.");
    expect(announce.onDragCancel({ active, over: null })).toBe("Flytten avbröts, omgång 1 ligger kvar.");
  });

  it("says when the row is outside the list", () => {
    expect(announce.onDragOver({ active, over: null })).toBe("omgång 1 är utanför listan.");
    expect(announce.onDragEnd({ active, over: null })).toBe("omgång 1 släpptes utanför listan.");
  });
});
