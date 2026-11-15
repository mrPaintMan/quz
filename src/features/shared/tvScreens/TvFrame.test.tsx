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

  it("puts the corner level with the title, not with the line above it", () => {
    render(<TvFrame eyebrow="Omgång 1 · Fråga 3" title="Julmat" corner={<p>0:42</p>} />);
    expect(screen.getByText("0:42").parentElement).toContainElement(screen.getByRole("heading", { name: "Julmat" }));
    expect(screen.getByText("0:42").parentElement).not.toContainElement(screen.getByText("Omgång 1 · Fråga 3"));
  });

  it("can centre the title over the content, for screens that aren't questions", () => {
    render(<TvFrame eyebrow="Omgång 1" title="Topplista" titleCentered />);
    expect(screen.getByRole("heading", { name: "Topplista" }).closest("header")).toHaveClass("text-center");
  });

  it("shows the corner beside the title", () => {
    render(<TvFrame title="Julmat" corner={<p>0:42</p>} />);
    expect(screen.getByText("0:42")).toBeInTheDocument();
  });

  it("can show the title as a large heading in the middle, with its corner and content", () => {
    render(
      <TvFrame eyebrow="Omgång 1" title="Julmat" corner={<p>0:42</p>} centered>
        <p>Innehåll</p>
      </TvFrame>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Julmat" })).toHaveClass("text-[7cqw]");
    expect(screen.getByRole("heading", { level: 1 }).closest("div")).toHaveClass("text-center");
    expect(screen.getByText("0:42")).toBeInTheDocument();
    expect(screen.getByText("Innehåll")).toBeInTheDocument();
  });
});
