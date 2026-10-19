import { describe, expect, it } from "vitest";
import { clueText } from "./clueText";

describe("clueText", () => {
  it("gives a clue's text", () => {
    expect(clueText("Här finns en ishotell")).toBe("Här finns en ishotell");
  });

  it("gives the text of a clue saved with its own points", () => {
    expect(clueText({ text: "Här finns en gruva", points: 10 })).toBe("Här finns en gruva");
  });
});
