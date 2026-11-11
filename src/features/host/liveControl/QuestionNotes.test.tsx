import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { QuestionNotes } from "./QuestionNotes";

describe("QuestionNotes", () => {
  it("shows the notes as written", () => {
    render(<QuestionNotes notes={"Rad ett\nRad två"} />);
    expect(screen.getByText("Anteckningar")).toBeInTheDocument();
    expect(screen.getByText(/Rad ett/)).toHaveClass("whitespace-pre-wrap");
  });

  it("folds the notes away until opened", async () => {
    render(<QuestionNotes notes="Säg något kul." folded />);
    expect(screen.getByText("Säg något kul.")).not.toBeVisible();
    await userEvent.click(screen.getByText("Anteckningar för frågan på TV:n"));
    expect(screen.getByText("Säg något kul.")).toBeVisible();
  });

  it("shows nothing without notes", () => {
    const { container } = render(<QuestionNotes notes="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
