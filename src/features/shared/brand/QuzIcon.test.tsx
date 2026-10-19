import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuzIcon } from "./QuzIcon";

describe("QuzIcon", () => {
  it("is an image named by its title", () => {
    render(<QuzIcon title="Quz" />);
    expect(screen.getByRole("img", { name: "Quz" })).toBeInTheDocument();
  });

  it("is hidden from screen readers without a title", () => {
    const { container } = render(<QuzIcon />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
