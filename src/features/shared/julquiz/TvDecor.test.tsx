import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PineBed, TvDecor } from "./TvDecor";

const corners = (container: HTMLElement) => container.querySelectorAll('img[src="/julquiz/pine-corner.webp"]');

describe("TvDecor", () => {
  it("lays the tree pattern and the lights behind the screen, with pine in both lower corners", () => {
    const { container } = render(<TvDecor corners />);
    const decor = screen.getByTestId("julquiz-decor");
    expect(decor).toHaveAttribute("aria-hidden", "true");
    expect(decor.style.backgroundImage).toContain("data:image/svg+xml");
    expect(container.querySelectorAll(".julquiz-bulb")).toHaveLength(20);
    expect(corners(container)).toHaveLength(2);
  });

  it("leaves the corners out on a screen whose box lies on a bed of pine", () => {
    const { container } = render(<TvDecor corners={false} />);
    expect(corners(container)).toHaveLength(0);
  });
});

describe("PineBed", () => {
  it("draws the bed under its box, hidden from screen readers", () => {
    render(<PineBed />);
    expect(screen.getByTestId("julquiz-pine-bed")).toHaveClass("julquiz-pine-bed");
    expect(screen.getByTestId("julquiz-pine-bed")).toHaveAttribute("aria-hidden", "true");
  });
});
