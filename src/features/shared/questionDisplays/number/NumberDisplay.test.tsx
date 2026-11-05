import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NumberAnswer, NumberQuestion } from "./NumberDisplay";

describe("NumberQuestion", () => {
  it("adds nothing to the question", () => {
    const { container } = render(<NumberQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("NumberAnswer", () => {
  it("shows the right number with a decimal comma", () => {
    render(<NumberAnswer revealed={{ type: "number", answer: 2.5 }} imageUrls={{}} />);
    expect(screen.getByText("2,5")).toBeInTheDocument();
  });

  it("shows nothing without a right number", () => {
    const { container } = render(<NumberAnswer revealed={{ type: "number", answer: null }} imageUrls={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
