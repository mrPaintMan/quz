import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { glowDelay, litOrders, PartEnd, Pill, PointsBadge, resultClass, ResultNote, RightAnswer } from "./resultLook";

describe("resultClass", () => {
  it("lights a scored part, leaves a wrong one as sent, dashes one being judged and fades one already counted", () => {
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
  it("shows a scored part's points, a red ✕ on a wrong one, and nothing while one waits", () => {
    render(<PointsBadge points={0.5} />);
    expect(screen.getByText("+0,5 p")).toBeInTheDocument();
    render(<PartEnd part={{ label: "", given: "x", result: "wrong", correct: "", points: 0 }} />);
    expect(screen.getByRole("img", { name: "Fel" })).toHaveClass("text-destructive");
    const { container } = render(<PartEnd part={{ label: "", given: "x", result: "pending", correct: "", points: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives the right answer", () => {
    render(<RightAnswer>Saffran</RightAnswer>);
    expect(screen.getByText("Rätt svar: Saffran")).toBeInTheDocument();
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

describe("litOrders", () => {
  it("numbers the parts that scored in turn", () => {
    const part = (result: "right" | "wrong") => ({ label: "", given: "", result, correct: "", points: 0 });
    expect(litOrders([part("right"), part("wrong"), undefined, part("right")])).toEqual([0, 0, 0, 1]);
  });
});

describe("Pill", () => {
  it("is gold on dark", () => {
    render(<Pill>+1 p</Pill>);
    expect(screen.getByText("+1 p")).toHaveClass("text-primary");
  });
});
