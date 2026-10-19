import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuzWordmark } from "./QuzWordmark";

describe("QuzWordmark", () => {
  it("is an image named by its title", () => {
    render(<QuzWordmark title="Quz" />);
    expect(screen.getByRole("img", { name: "Quz" })).toBeInTheDocument();
  });

  it("is hidden from screen readers without a title", () => {
    const { container } = render(<QuzWordmark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
