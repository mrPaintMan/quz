import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { glowDelay, PartEnd, PointsBadge, ResultNote, resultClass } from "./resultLook";

describe("resultClass", () => {
  it("lights a scored part, dashes one being judged and fades one already counted", () => {
    expect(resultClass("right")).toBe("result-lit");
    expect(resultClass("pending")).toContain("border-dashed");
    expect(resultClass("repeat")).toBe("opacity-45");
    expect(resultClass("wrong")).toBe("");
    expect(resultClass(undefined)).toBe("");
  });
});

describe("glowDelay", () => {
  it("lights the parts one after another", () => {
    expect(glowDelay(2)).toEqual({ animationDelay: "300ms" });
  });
});

describe("PointsBadge and PartEnd", () => {
  it("shows a scored part's points, and nothing for one that didn't score", () => {
    render(<PointsBadge points={0.5} />);
    expect(screen.getByText("+0,5 p")).toBeInTheDocument();
    const { container } = render(<PartEnd part={{ label: "", given: "x", result: "wrong", correct: "", points: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ResultNote", () => {
  it("says why a part gave nothing yet", () => {
    render(
      <>
        <ResultNote result="pending" />
        <ResultNote result="repeat" />
        <ResultNote result="right" />
      </>,
    );
    expect(screen.getByText("Bedöms…")).toBeInTheDocument();
    expect(screen.getByText("Räknas redan")).toBeInTheDocument();
  });
});
