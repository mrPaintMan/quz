import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FreeTextAnswer, FreeTextQuestion } from "./FreeTextDisplay";

describe("FreeTextQuestion", () => {
  it("adds nothing to a question with a single field", () => {
    const { container } = render(<FreeTextQuestion shown={{ type: "freeText", labels: [""] }} imageUrls={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the sub-questions", () => {
    render(<FreeTextQuestion shown={{ type: "freeText", labels: ["Artist", ""] }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["a) Artist", "Delfråga b)"]);
  });
});

describe("FreeTextAnswer", () => {
  it("shows a single answer on its own", () => {
    render(<FreeTextAnswer revealed={{ type: "freeText", fields: [{ label: "", answer: "Kanel" }] }} imageUrls={{}} />);
    expect(screen.getByText("Kanel")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows each sub-question with its answer", () => {
    const fields = [
      { label: "Artist", answer: "ABBA" },
      { label: "Låt", answer: "Waterloo" },
    ];
    render(<FreeTextAnswer revealed={{ type: "freeText", fields }} imageUrls={{}} />);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["a) ArtistABBA", "b) LåtWaterloo"]);
  });
});
