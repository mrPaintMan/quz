import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TvTimer } from "./TvTimer";

describe("TvTimer", () => {
  it("shows the time left", () => {
    render(<TvTimer timer={{ kind: "paused", remainingMs: 42_000 }} />);
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
  });

  it("shows nothing without a timer", () => {
    const { container } = render(<TvTimer timer={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
