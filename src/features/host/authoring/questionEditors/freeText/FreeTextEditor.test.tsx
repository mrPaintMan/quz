import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { FreeTextEditor } from "./FreeTextEditor";

const single: ContentOf<"freeText"> = {
  type: "freeText",
  fields: [{ label: "", acceptedAnswers: ["kanel"] }],
  pointsPerField: 1,
  fuzzy: true,
};

const threeFields: ContentOf<"freeText"> = {
  ...single,
  fields: [
    { label: "Torget?", acceptedAnswers: ["Stortorget"] },
    { label: "Året?", acceptedAnswers: ["1890"] },
    { label: "", acceptedAnswers: [] },
  ],
};

describe("FreeTextEditor", () => {
  it("edits the accepted answers of a plain free-text question", async () => {
    const onChange = vi.fn();
    render(<FreeTextEditor content={single} onChange={onChange} />);
    expect(screen.queryByText(/Delfråga/)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Godkända svar"), "{enter}kanelstång");
    expect(onChange.mock.lastCall?.[0].fields[0].acceptedAnswers).toEqual(["kanel", "kanelstång"]);
  });

  it("adds a sub-question", async () => {
    const onChange = vi.fn();
    render(<FreeTextEditor content={single} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till delfråga" }));
    expect(onChange.mock.lastCall?.[0].fields).toHaveLength(2);
  });

  it("edits, labels and removes sub-questions, up to three", async () => {
    const onChange = vi.fn();
    render(<FreeTextEditor content={threeFields} onChange={onChange} />);
    expect(screen.queryByRole("button", { name: "Lägg till delfråga" })).not.toBeInTheDocument();
    await userEvent.type(screen.getAllByLabelText("Text i svarsfältet")[2], "V");
    expect(onChange.mock.lastCall?.[0].fields[2].label).toBe("V");
    await userEvent.click(screen.getByRole("button", { name: "Ta bort delfråga b" }));
    expect(onChange.mock.lastCall?.[0].fields.map((field: { label: string }) => field.label)).toEqual(["Torget?", ""]);
    expect(screen.getByLabelText("Poäng per delfråga")).toBeInTheDocument();
  });

  it("edits the points and fuzzy matching", async () => {
    const onChange = vi.fn();
    render(<FreeTextEditor content={single} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Poäng"), "5");
    expect(onChange.mock.lastCall?.[0].pointsPerField).toBe(15);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange.mock.lastCall?.[0].fuzzy).toBe(false);
  });
});
