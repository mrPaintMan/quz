import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeLogoLink } from "./HomeLogoLink";

describe("HomeLogoLink", () => {
  it("links to the home page under the name Quz", () => {
    render(<HomeLogoLink />);
    expect(screen.getByRole("link", { name: "Quz" })).toHaveAttribute("href", "/");
  });
});
