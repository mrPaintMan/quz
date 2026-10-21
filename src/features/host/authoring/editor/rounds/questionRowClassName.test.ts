import { describe, expect, it } from "vitest";
import { questionRowClassName } from "./questionRowClassName";

describe("questionRowClassName", () => {
  it("frames the selected question in the primary colour", () => {
    expect(questionRowClassName(true)).toContain("border-primary");
    expect(questionRowClassName(false)).not.toContain("border-primary");
  });
});
