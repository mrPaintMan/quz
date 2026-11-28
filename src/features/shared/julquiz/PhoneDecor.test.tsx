import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhoneDecor } from "./PhoneDecor";

const corners = (container: HTMLElement) => container.querySelectorAll('img[src="/julquiz/pine-corner.webp"]');

describe("PhoneDecor", () => {
  it("fixes the pattern, a shorter string of lights and small corners behind the page", () => {
    const { container } = render(<PhoneDecor />);
    expect(screen.getByTestId("julquiz-decor")).toHaveClass("fixed");
    expect(container.querySelectorAll(".julquiz-bulb")).toHaveLength(8);
    expect(corners(container)).toHaveLength(2);
  });
});
