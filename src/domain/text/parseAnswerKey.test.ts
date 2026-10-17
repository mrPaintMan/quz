import { describe, expect, it } from "vitest";
import { parseAnswerKey } from "./parseAnswerKey";

describe("parseAnswerKey", () => {
  it("reads one item per line with alternative spellings separated by slashes", () => {
    expect(parseAnswerKey("Oslo\nKöpenhamn / København\n")).toEqual([
      { spellings: ["Oslo"] },
      { spellings: ["Köpenhamn", "København"] },
    ]);
  });

  it("ignores empty spellings around slashes", () => {
    expect(parseAnswerKey("Rom / ")).toEqual([{ spellings: ["Rom"] }]);
  });
});
