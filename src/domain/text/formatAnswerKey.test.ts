import { describe, expect, it } from "vitest";
import { formatAnswerKey } from "./formatAnswerKey";
import { parseAnswerKey } from "./parseAnswerKey";

describe("formatAnswerKey", () => {
  it("writes one item per line with spellings separated by slashes", () => {
    expect(formatAnswerKey([{ spellings: ["Oslo"] }, { spellings: ["Köpenhamn", "København"] }])).toBe(
      "Oslo\nKöpenhamn / København",
    );
  });

  it("round-trips with parseAnswerKey", () => {
    const text = "Oslo\nKöpenhamn / København";
    expect(formatAnswerKey(parseAnswerKey(text))).toBe(text);
  });
});
