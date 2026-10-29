import { describe, expect, it } from "vitest";
import { timeLeftText } from "./timeLeftText";

describe("timeLeftText", () => {
  it("shows the time left as minutes and seconds", () => {
    expect(timeLeftText(65)).toBe("1:05");
  });

  it("says when the time is out", () => {
    expect(timeLeftText(0)).toBe("Tiden är ute!");
  });
});
