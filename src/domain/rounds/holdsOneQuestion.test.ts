import { describe, expect, it } from "vitest";
import { holdsOneQuestion } from "./holdsOneQuestion";

describe("holdsOneQuestion", () => {
  it("holds a På spåret round to its one trip", () => {
    expect(holdsOneQuestion("paSparet")).toBe(true);
  });

  it("lets a question round hold many questions", () => {
    expect(holdsOneQuestion("questions")).toBe(false);
  });
});
