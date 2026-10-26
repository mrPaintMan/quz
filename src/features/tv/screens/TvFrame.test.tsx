import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TvFrame } from "./TvFrame";

describe("TvFrame", () => {
  it("shows the title as the heading, with the line above it and the content", () => {
    render(
      <TvFrame eyebrow="Omgång 1" title="Julmat">
        <p>Innehåll</p>
      </TvFrame>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Julmat" })).toBeInTheDocument();
    expect(screen.getByText("Omgång 1")).toBeInTheDocument();
    expect(screen.getByText("Innehåll")).toBeInTheDocument();
  });
});
