import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CenterPin } from "./CenterPin";

describe("CenterPin", () => {
  it("is decoration that screen readers and pointers pass through", () => {
    const { container } = render(<CenterPin />);
    const pin = container.querySelector("svg");
    expect(pin).toHaveAttribute("aria-hidden", "true");
    expect(pin).toHaveClass("pointer-events-none");
  });
});
