import { describe, expect, it } from "vitest";
import { parseLines } from "./parseLines";

describe("parseLines", () => {
  it("splits on line breaks, trims and drops blank lines", () => {
    expect(parseLines(" kanel \n\nkanelstång\n")).toEqual(["kanel", "kanelstång"]);
  });
});
