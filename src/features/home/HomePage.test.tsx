import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("shows the logo as its heading and links the hosts to the admin", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Quz" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "För domare" })).toHaveAttribute("href", "/admin");
  });
});
