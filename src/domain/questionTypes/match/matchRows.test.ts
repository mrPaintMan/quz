import { describe, expect, it } from "vitest";
import { rowsOfAnswer, tapRow, textsOfRows } from "./matchRows";

const right = ["ABBA", "Roxette", "ABBA"];

describe("rowsOfAnswer", () => {
  it("puts each text in its row, a repeated text in the first free row", () => {
    expect(rowsOfAnswer(["ABBA", null, "ABBA"], right)).toEqual([0, null, 2]);
  });

  it("leaves a text no longer shown unpaired", () => {
    expect(rowsOfAnswer(["Kent", "Roxette"], right)).toEqual([null, 1]);
  });
});

describe("textsOfRows", () => {
  it("gives the texts of the rows joined", () => {
    expect(textsOfRows([2, null, 1], right)).toEqual(["ABBA", null, "Roxette"]);
  });
});

describe("tapRow", () => {
  const none = [null, null, null];

  it("selects a row, and unselects it on a second tap", () => {
    const first = tapRow(none, null, { side: "left", index: 0 });
    expect(first.selection).toEqual({ side: "left", index: 0 });
    expect(tapRow(none, first.selection, { side: "left", index: 0 }).selection).toBeNull();
  });

  it("moves the selection to another row on the same side", () => {
    expect(tapRow(none, { side: "left", index: 0 }, { side: "left", index: 1 }).selection).toEqual({ side: "left", index: 1 });
  });

  it("joins the selected row with a row on the other side, starting from either side", () => {
    expect(tapRow(none, { side: "left", index: 0 }, { side: "right", index: 2 })).toEqual({ rowByLeft: [2, null, null], selection: null });
    expect(tapRow(none, { side: "right", index: 1 }, { side: "left", index: 2 })).toEqual({ rowByLeft: [null, null, 1], selection: null });
  });

  it("takes a right row from the pair it was in", () => {
    expect(tapRow([1, null, null], { side: "left", index: 2 }, { side: "right", index: 1 }).rowByLeft).toEqual([null, null, 1]);
  });

  it("takes a paired left row apart when tapped with nothing selected, from either side", () => {
    expect(tapRow([1, null, null], null, { side: "left", index: 0 }).rowByLeft).toEqual(none);
    expect(tapRow([1, null, null], null, { side: "right", index: 1 }).rowByLeft).toEqual(none);
  });
});
